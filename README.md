# Sample NodeJS application for Azure Pipelines docs


## Getting started

Taking a look at the sample I have mixed feelings about it as it uses Gulp, Mocha, and Istanbul for running tests and coverage.  Since we had already decided on NPM and Jest to cover these bases, it seems like a backwards step.  Gulp was all the rave back in 2014, but by the time Angular came out of AngularJS, it was decided that one build ssytem was enough, and the NPM should take the place of Grunt, Gulp and the other front and back end build systems.  So again I'm questioning Microsoft's level of commitment to JavaScript when their code examples rely on out dated tech.

But, on the pro side, this repo is set up for Docker with a CI pipeline.  It is strongly recommended that you use a pre-build Docker image for a particular service such as Azure, so really, a functioning CI pipeline should be a starting point, and we can always setup our own linting, testing and building as we have done with this project so far.

So time to see how this pipeline goes.

First we will follow the instructions in [Create your first pipeline](https://docs.microsoft.com/en-us/azure/devops/pipelines/get-started-yaml?view=azdevops) to create a build pipeline for the sample app.

Right at the start there is [another link](https://go.microsoft.com/fwlink/?LinkId=307137) because you need an Azure DevOps organization first.  The link asks you to login to your MS account and then create the new project first, which we called strumosa-pipe to align with out strumosa project.

The [sample code](https://github.com/MicrosoftDocs/pipelines-javascript).


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
