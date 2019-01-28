# A NodeJS application with an Azure DevOps Pipeline

[![Build Status](https://dev.azure.com/timofeyc/strumosa-pipe/_apis/build/status/timofeysie.strumosa-pipe?branchName=master)](https://dev.azure.com/timofeyc/strumosa-pipe/_build/latest?definitionId=1?branchName=master)


## Getting started

Taking a look at the sample I have mixed feelings about it as it uses Gulp, Mocha, and Istanbul for running tests and coverage.  Since we had already decided on NPM and Jest to cover these bases, it seems like a backwards step.  Gulp was all the rave back in 2014, but by the time Angular came out of AngularJS, it was decided that one build ssytem was enough, and the NPM should take the place of Grunt, Gulp and the other front and back end build systems.  So again I'm questioning Microsoft's level of commitment to JavaScript when their code examples rely on out dated tech.

But, on the pro side, this repo is set up for Docker with a CI pipeline.  It is strongly recommended that you use a pre-build Docker image for a particular service such as Azure, so really, a functioning CI pipeline should be a starting point, and we can always setup our own linting, testing and building as we have done with this project so far.

So time to see how this pipeline goes.

First we will follow the instructions in [Create your first pipeline](https://docs.microsoft.com/en-us/azure/devops/pipelines/get-started-yaml?view=azdevops) to create a build pipeline for the sample app.

Right at the start there is [another link](https://go.microsoft.com/fwlink/?LinkId=307137) because you need an Azure DevOps organization first.  The link asks you to login to your MS account and then create the new project first, which we called strumosa-pipe to align with out strumosa project.

The [sample code](https://github.com/MicrosoftDocs/pipelines-javascript) for this repo we had to add to the GitHub account.  Then allow Azure access to it.  Then, the DevOps pipe runs based on the yaml file.  All very exciting.  This is what the pipeline looks like on the [portal site](https://dev.azure.com/timofeyc/strumosa-pipe/_build/results?buildId=1):
```
Job Started: 28/01/2019, 11:12:56
Pool: Hosted Ubuntu 1604
Agent: Hosted Agent 44s
Initialize Agent succeeded <1s
Initialize job succeeded 2s
Get sources succeeded 7s
NodeTool succeeded 9s
npm install 22s
Task         : npm
Description  : Install and publish npm packages, or run an npm command. Supports npmjs.com and authenticated registries like Package Management.
Version      : 1.144.0
Author       : Microsoft Corporation
Help         : [More Information](https://go.microsoft.com/fwlink/?LinkID=613746)
==============================================================================
SYSTEMVSSCONNECTION exists true
SYSTEMVSSCONNECTION exists true
[command]/opt/hostedtoolcache/node/8.15.0/x64/bin/npm --version
6.4.1
[command]/opt/hostedtoolcache/node/8.15.0/x64/bin/npm config list
; cli configs
metrics-registry = "https://registry.npmjs.org/"
scope = ""
user-agent = "npm/6.4.1 node/v8.15.0 linux x64"
; environment configs
userconfig = "/home/vsts/work/1/npm/1.npmrc"
; node bin location = /opt/hostedtoolcache/node/8.15.0/x64/bin/node
; cwd = /home/vsts/work/1/s
; HOME = /home/vsts
; "npm config ls -l" to show all defaults.
[command]/opt/hostedtoolcache/node/8.15.0/x64/bin/npm install
npm test pending
PublishTestResults pending
PublishCodeCoverageResults pending
ArchiveFiles pending
PublishBuildArtifacts pending
Post-job: Get sources
```

All succeeded and I even got an email saying the build succeeded.  How civilized.  This is definitely the way to do. 

Next, we can show off and add a CI status badge to the repo.  The portal makes this easy.  In Azure Pipelines, go to the Build page to view the list of pipelines.  Select the pipeline that was created and in the context menu for the pipeline, select Status badge.

Now we can configure your pipeline to run tests, publish test results, create container images, or even deploy the app to a cloud service.  The end of the pipeline creation tutorial there is a link back to the [Build, test, and deploy JavaScript and Node.js apps in Azure Pipelines](https://docs.microsoft.com/en-us/azure/devops/pipelines/languages/javascript?view=azdevops&tabs=yaml) tutorial where we can pick up again after the link to creating a first pipeline.

We can use a specific version of Node.js or multiple node versions if we want.  We can start with whatever was setup for now as there are no specific requirements for the project yet.

The only script we have right now in the package.json file is this:
```
"test": "nyc --reporter=cobertura --reporter=html ./node_modules/.bin/mocha tests/**/*.js --reporter mocha-junit-reporter --reporter-options mochaFile=./TEST-RESULTS.xml"
```

Not sure what we need to be doing here.  We could install the latest version of the Angular CLI by using npm. The rest of the pipeline can then use the ng tool from other script stages.

We can use NPM in a few ways to download packages for the build.  We can use compilers such as Babel and the TypeScript tsc compiler to convert the source code into versions that are usable by the Node.js runtime or in web browsers.  Now that I am interested in.  I failed to create a TypeScript project that was deployed to Heroku and had to revert to vanilla JS to get things going.

The docs all show how to add scripts steps to the yaml files.  For example, out of the box we have these in the azure-pipelines.acr.yml:
```
steps:
- script: |
    npm install
    npm test
    docker build -f Dockerfile -t $(dockerId).azurecr.io/$(imageName) .
    docker login -u $(dockerId) -p $pswd $(dockerId).azurecr.io
    docker push $(dockerId).azurecr.io/$(imageName)
```

Almost the same thing is in the azure-pipelines.docker.yml file:
```
steps:
- script: |
    npm install
    npm test
    docker build -f Dockerfile -t $(dockerId)/$(imageName) .
    docker login -u $(dockerId) -p $pswd
    docker push $(dockerId)/$(imageName)
```

Since there are three yaml files in the project already, which one should we put new steps into?
```
azure-pipelines.yml
azure-pipelines.acr.yml
azure-pipelines.docker.yml
```

The PublishTestResults task is in all three files.  But since we already have tests running in the pipeline, what we really wand is to deploy the code into production.  Finally we get to the package and deliver code section.  After creating a project which was deployment by dragging a zip file onto the portal webpage, this description matches that:
*package the build output into a .zip file to be deployed to a web application.*

In the ```azure-pipelines.yml``` file we have a simple ```PublishBuildArtifacts``` task.

The example in the docs builds on that and adds ```CopyFiles``` and ```PublishBuildArtifacts``` tasks.

That all looks like this:
```
- task: PublishTestResults@2
  condition: succeededOrFailed()
  inputs:
    testResultsFiles: '**/TEST-RESULTS.xml'
    testRunTitle: 'Test results for JavaScript'
- task: PublishCodeCoverageResults@1
  inputs: 
    codeCoverageTool: Cobertura
    summaryFileLocation: '$(System.DefaultWorkingDirectory)/**/*coverage.xml'
    reportDirectory: '$(System.DefaultWorkingDirectory)/**/coverage'
```

Big question, what is the DefaultWorkingDirectory?  Yesterday we had to create an few things in order to get to the point where we dragged the zip file into the container.  After reading that the server could build the project for us without zipping up the entire dev dependencies which were not used I found this project to solve that issue.  Right now it's worth a commit and push to see what happens with those tasks.




## Links
For information on how to use this repository, see [JavaScript](https://docs.microsoft.com/azure/devops/pipelines/languages/javascript).

| Example | Build status |
|---------|--------------|
| Build | [![Build status](https://dev.azure.com/pipelines-docs/docs/_apis/build/status/javascript/nodejs)](https://dev.azure.com/pipelines-docs/docs/_build/latest?definitionId=7) |
| Build (YAML) | [![Build status](https://dev.azure.com/pipelines-docs/docs/_apis/build/status/javascript/nodejs-yaml)](https://dev.azure.com/pipelines-docs/docs/_build/latest?definitionId=8) |
| Build image and push to Docker Hub | [![Build status](https://dev.azure.com/pipelines-docs/docs/_apis/build/status/javascript/nodejs-dockerhub)](https://dev.azure.com/pipelines-docs/docs/_build/latest?definitionId=9) |
| Build image and push to Docker Hub (YAML) | [![Build status](https://dev.azure.com/pipelines-docs/docs/_apis/build/status/javascript/nodejs-dockerhub-yaml)](https://dev.azure.com/pipelines-docs/docs/_build/latest?definitionId=10) |
| Build image and push to Azure Container Registry | [![Build status](https://dev.azure.com/pipelines-docs/docs/_apis/build/status/javascript/nodejs-acr)](https://dev.azure.com/pipelines-docs/docs/_build/latest?definitionId=11) |
| Build image and push to Azure Container Registry (YAML) | [![Build status](https://dev.azure.com/pipelines-docs/docs/_apis/build/status/javascript/nodejs-acr-yaml)](https://dev.azure.com/pipelines-docs/docs/_build/latest?definitionId=12) |

## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

# Legal Notices

Microsoft and any contributors grant you a license to the Microsoft documentation and other content
in this repository under the [Creative Commons Attribution 4.0 International Public License](https://creativecommons.org/licenses/by/4.0/legalcode),
see the [LICENSE](LICENSE) file, and grant you a license to any code in the repository under the [MIT License](https://opensource.org/licenses/MIT), see the
[LICENSE-CODE](LICENSE-CODE) file.

Microsoft, Windows, Microsoft Azure and/or other Microsoft products and services referenced in the documentation
may be either trademarks or registered trademarks of Microsoft in the United States and/or other countries.
The licenses for this project do not grant you rights to use any Microsoft names, logos, or trademarks.
Microsoft's general trademark guidelines can be found at http://go.microsoft.com/fwlink/?LinkID=254653.

Privacy information can be found at https://privacy.microsoft.com/en-us/

Microsoft and any contributors reserve all others rights, whether under their respective copyrights, patents,
or trademarks, whether by implication, estoppel or otherwise.
