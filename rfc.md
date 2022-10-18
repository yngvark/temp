# RFC-KM-0002 - Continuous Integration / Continuous Delivery
​
## Info
​
* Authors: [Karl Mathias Moberg](@kmoberg)
* Status: Pending Feedback
* Deadline: ??-10-2022
​
## Background
​
Providing a robust and easy-to-use CI/CD pipeline system is critically important for developers, and with a multitude of offerings available it is hard to determine which provider gives the best solution for Origo. Per October 2022, most teams in Origo use GitHub Actions to build and deploy their code to testing- and production environments, however questions have been raised about using offerings from AWS such as AWS CodePipeline, AWS CodeBuild, and CodeDeploy, and what differentiates these tools the offerings from GitHub.
​
Please note that in this sphere, a plethora of other tools serving the same market such as Jenkins (X), CircleCI, TeamCity, and more exists. These tools have been evaluated by various Origo teams in the past, and teams have not adopted them, and as such have not been evaluated for this RFC, but instead we focused on GitHub Actions and AWS Code Pipelines which are already in use by teams. 
​
## Goals
​
* Give an overview of the tools offered by both AWS and GitHub
* Make it easy for teams to understand why you would choose one tool over the other
* Decide on what tools should be prioritized in v1 of the golden path
* Document why the golden path has been laid using this set of tools
​
## Assessment
​
GitHub Actions is the newest of the two tools, launched in late 2018[^1] after pressure from competing platforms such as GitLab CI/CD[^4] GitHub actions have taken the world by storm, and with over 40% of active repositories on GitHub using GitHub Actions[^2] it has tremendous developer support across the industry. It allows building and deploying applications to various infrastructures be it in one or more cloud providers or on-premise. 
​
When we are talking about AWS CodePipeline, we are in reality talking about a suite of applications that ties multiple AWS tools into one continuous pipeline. CodePipeline uses tools such as CodeCommit, CodeBuild, and CodeDeploy to automatically store your code in a Git repo, build it, and finally deploy it to your AWS cloud infrastructure. Being an AWS tool, CodePipeline utilizes existing IAM[^3] permissions to determine who can access and deploy code to production without needing additional security. 
​
### GitHub Actions
​
Even though GitHub Actions is the newer of the two products assessed in this RFC, GitHub actions have broader support for various types of deployments, and programming languages and the offering is therefore often considered more flexible for developers and platform engineers than CodePipeline. GitHub Actions allow developers to choose which platform to run workflows on, be it Linux, macOS, or even Windows Server, and has broad support for languages when building code and supports a myriad of endpoints to deploy the artifacts to, in particular, cloud platforms.
​
Workflows are defined in one or more `.github/workflows/workflow.yml` files in a repository, and events will trigger on changes in that specific repository. Workflows can be run sequentially or in parallel to optimize and reduce the time spent on completing the actions and can be defined for each set of actions (such as one workflow for building and testing pull requests, one for merges to main, when an issue is opened or on a commit to a branch).
​
GitHub has a large marketplace of free actions created by not only GitHub but also various software vendors and the broader GitHub community, that easily can be re-used and incorporated into your workflows, to quickly set up very powerful pipelines with minimal code. 
​
​
​
#### Security
​
The preferred method of deploying artifacts from a build to an environment is by using an OIDC[^5][^6 ] provider in each account one wants to deploy to, to exchange short-lived tokens with the cloud provider instead of providing IAM credentials. The OIDC provider should be scoped to only have access to the AWS tools and functions needed for the project to reduce the blast radius of a potentially compromised repository. 
​
Unlike CodePipelines which need to be explicitly configured independently of the application codebase, GitHub actions live in the same repo as the code, and real damage can be done by a developer or malicious user that modifies the `workflow.yml` file to run their commands or add additional infrastructure. This risk can be mitigated through the use of branch protection rules[^7] and ensuring all pull requests are reviewed by another user. 
​
#### Reliability
​
Although mostly stable and known for decent performance, GitHub (Actions) has for multiple years been plagued with downtime and unavailability. GitHub being unavailable has become so prominent that even back in 2017 developers made fun of it[^8]. On the GitHub status page[^9] we can see that GitHub had no less than 16 incidents in September 2022, where 90% of them were involving GitHub actions or were pipeline-related and were of high or critical severity causing downtime for customers.
​
This isn't to say GitHub (Actions) is too unreliable to depend on, it is just an important metric to consider when evaluating the product.
​
#### Developer Feedback
​
Where GitHub actions truly shine is developer feedback. You can configure a plethora of various notification mediums: Slack, e-mail, browser- and mobile notifications, you name it, GitHub probably supports it - and these notifications can happen when a pull request is opened, someone comments on an item you subscribe to when an action fails or several other alerts. 
​
Configuration is simple through your personal notification settings, or through the `workflow.yml` file for integrations with Slack or other webhook-based notification recipients. 
​
#### GitHub Container Registry (ghcr.io)
​
On top of the other GitHub features, GitHub also offers a container registry, similar to Docker Hub - a centralized location for storing container images after they are built. The GitHub Container Registry (ghcr) offers private repository storage for containers up to 2GB in size for existing GitHub Team and Pro users and has a nearly identical feature set to Docker Hub. When already using GitHub Actions for CI/CD, ghcr becomes a natural way to store the container artifact after it has been built using the already established authentication with GitHub services in the pipeline. 
​
As with other GitHub services, reliability questions have been raised by several teams in Origo, questioning if it is dependable enough for use: what happens if a container crashes in production and a new one needs to be spun up in ECS and ghcr is down, like it has been multiple times in September 2022? [^9] 
​
#### Flexibility
​
Storing GitHub Action workflows in `.github/workflows` does give developers great flexibility when working with multiple or new projects. By utilizing environment variables in the workflow, it can be extremely simple to copy a workflow from one project to another and have a new pipeline setup in a few minutes. It also allows for the sharing of workflows between teams in the organization.
​
#### Performance
​
Although it is hard to apples-to-apples compare the performance of the two solutions, experience from teams has shown that larger build jobs and workflows in GitHub Actions can spend a lot of time to complete, in some situations between 10-20 minutes, especially when you have multiple steps that need to complete sequentially. This is often related to the cold-start timing of a lot of the GitHub Action functionality but it can also in some situations be related to running out of available CPU. 
​
According to GitHub documentation[^10], GitHub action runners have the following specs:
​
* 2-core CPU (x86_64)
* 7 GB of RAM
* 14 GB of SSD space
​
As of writing, GitHub does not offer any alternatives to these specifications for larger build projects.
​
###  AWS CodePipeline
​
When discussing AWS CodePipeline we are more correctly talking about multiple AWS products that AWS CodePipeline ties together to build one continuous CI/CD pipeline. This RFC focuses on how AWS CodePipeline ties together the most common services: GitHub, AWS CodeBuild, AWS CodeDeploy, and Amazon ECR. We will specifically not use AWS CodeCommit or S3 for source code control as both have previously been deemed by teams in Origo to provide a worse product than GitHub.
​
AWS CodePipelines are configured either in the AWS console or preferably using Terraform. In each pipeline, you define one or more stages such as `source` `build` and `deploy`. You can have multiple build- or deploy stages if needed. 
​
An example build stage in terraform:
​
```HCL
stage {
    name = "Build"
​
    action {
      name             = "Build"
      category         = "Build"
      owner            = "AWS"
      provider         = "CodeBuild"
      input_artifacts  = ["source_output"]
      output_artifacts = ["build_output"]
      version          = "1"
​
      configuration = {
        ProjectName = "test"
      }
    }
  }
```
​
CodePipeline is typically connected to a GitHub repo using GitHub webhooks and will react immediately to any changes that happen in a specified branch. AWS takes care of authentication to GitHub after initial authentication and there is no need for the creation of any security tokens or similar.
​
​
​
​
​
#### Security
​
AWS CodePipeline uses AWS IAM
​
#### CodeBuild
​
Configured using .codebuild/workflow.yml
​
#### Reliability
​
Minimal to no downtime in several years.
​
#### ECR
​
Preferred by developers to store container images?
​
#### Developer Feedback 
​
Not certain?
​
#### Performance
​
Can pick from multiple build configurations to speed up code build.
​
​
​
## Risks
​
### GitHub Actions
​
- 2
​
### AWS CodePipeline
​
- 3
​
## Recommendation
​
​
​
​
​
​
​
## Definitions & References
​
[^1]: TechCrunch: [GitHub launches Actions, its workflow automation tool](https://techcrunch.com/2018/10/16/github-launches-actions-its-workflow-automation-tool/)
[^2]: GitHub: [The 2021 State of the Octoverse](https://octoverse.github.com/writing-code-faster/#scale-through-automation)
[^3]: IAM: Identity and Access Management
[^4]: GitLab CI/CD https://docs.gitlab.com/ee/ci/
[^5]: OIDC: OpenID Connect
[^6]: GitHub: [About security hardening with OpenID connect](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
[^7]: GitHub: [About Protected Branches]()https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches
[^8]: Hacker News: ["GitHub down" is the new compiling](https://news.ycombinator.com/item?id=13392097)
[^9]: GitHub Status: [History](https://www.githubstatus.com/history)
[^10]:GitHub: [Supported runners and hardware resources](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners#supported-runners-and-hardware-resources) 
[^]: 
[^]: 
[^]: 
[^]: 
[^6]: 
