# Strumosa-pipe

[![Build Status](https://dev.azure.com/timofeyc/strumosa-pipe/_apis/build/status/timofeysie.strumosa-pipe?branchName=master)](https://dev.azure.com/timofeyc/strumosa-pipe/_build/latest?definitionId=1?branchName=master)

This project NodeJS application with an Azure DevOps Pipeline.  It implements many of the NodeJS best practices on the [this popular list](https://github.com/i0natan/nodebestpractices) from the ni0natan GitHub repo.


* [The app is live at this location](http://strumosa.azurewebsites.net/)
* [The Azure DevOps pipeline dashboard](https://dev.azure.com/timofeyc/strumosa-pipe/_build?definitionId=1)
* [SonarCloud static analysis dashboard](https://sonarcloud.io/dashboard?id=timofeysie_strumosa-pipe)

So far there is linting with the super strict AirBnb stylesheet, testing with Mocha, coverage with Istanbul, and static analysis with Sonarqube.

There is still a lot to be done.  A partial list includes:
* separate Express API definitions from other networking concerns.
* Tagging tests with keywords like #cold #api #sanity so you can grep with the testing harness and invoke the desired subset.
* Use nginx, HAproxy, S3, or a CDN to serve apps.
* Create a ‘maintenance endpoint’ for system-related information.
* Use a security-related linter plugins such as eslint-plugin-security.


# Table of Contents

1. [The Marvel API](#the-marvel-api)
1. [Static Analysis with Sonarqube](#static-Analysis-with-Sonarqube)
1. [API Testing](#api-testing)
1. [Error handling best practices](#error-handling-best-practices)
1. [Getting started](#getting-started)
1. [Node Best practices](#node-best-practices)
1. [Links](#links)
1. [Contributing](#contributing)
1. [Legal Notices](#legal-notices)



#
## The Marvel API

The requirements requested to use the Marvel API to get data and send it to a client.
Also, we need to use an in-memory cache to speed up repeated calls.
Furthermore, since we deploy the app to Azure, we will need to store the private API key.

The *Marvel Authentication for Server-Side Applications* [docs](https://developer.marvel.com/documentation/authorization) state that *Server-side applications must pass two parameters in addition to the apikey parameter*
```
ts - a timestamp (or other long string which can change on a request-by-request basis)
hash - a md5 digest of the ts parameter, your private key and your public key (e.g. md5(ts+privateKey+publicKey)
```

That was pretty easy to accomplish.
```
exports.run = (name) => {
  const ts = new Date().getTime();
  const ts_private_public = ts + private_key + public_key;
  const hash = crypto.createHash('md5').update(ts_private_public).digest('hex');
  const testAPI = endpoint+`/v1/public/characters?apikey=${public_key}&ts=${ts}&hash=${hash}`;
  ...
```

The result for the characters API looks like this:
```
{  
   "code":200,
   "status":"Ok",
   "copyright":"© 2019 MARVEL",
   "attributionText":"Data provided by Marvel. © 2019 MARVEL",
   "attributionHTML":"<a href=\"http://marvel.com\">Data provided by Marvel. © 2019 MARVEL</a>",
   "etag":"0f611bfd97cfedf8073cfbaee6270d8d520f509a",
   "data":{  
      "offset":0,
      "limit":20,
      "total":1491,
      "count":20,
      "results":[  
         {  
            "id":1011334,
            "name":"3-D Man",
            "description":"",
            "modified":"2014-04-29T14:18:17-0400",
            "thumbnail":{  
               "path":"http://i.annihil.us/u/prod/marvel/i/mg/c/e0/535fecbbb9784",
               "extension":"jpg"
            },
            "resourceURI":"http://gateway.marvel.com/v1/public/characters/1011334",
            "comics":{  
               "available":12,
               "collectionURI":"http://gateway.marvel.com/v1/public/characters/1011334/comics",
               "items":[  
                  {  
                     "resourceURI":"http://gateway.marvel.com/v1/public/comics/21366",
                     "name":"Avengers: The Initiative (2007) #14"
                  },
                  ...
               ],
               "returned":12
            },
            "series":{  
               "available":3,
               "collectionURI":"http://gateway.marvel.com/v1/public/characters/1011334/series",
               "items":[  
                  {  
                     "resourceURI":"http://gateway.marvel.com/v1/public/series/1945",
                     "name":"Avengers: The Initiative (2007 - 2010)"
                  },
                  ...
               ],
               "returned":3
            },
            "stories":{  
               "available":21,
               "collectionURI":"http://gateway.marvel.com/v1/public/characters/1011334/stories",
               "items":[  
                  {  
                     "resourceURI":"http://gateway.marvel.com/v1/public/stories/19947",
                     "name":"Cover #19947",
                     "type":"cover"
                  },
                ...
               ],
               "returned":20
            },
            "events":{  
               "available":1,
               "collectionURI":"http://gateway.marvel.com/v1/public/characters/1011334/events",
               "items":[  
                  {  
                     "resourceURI":"http://gateway.marvel.com/v1/public/events/269",
                     "name":"Secret Invasion"
                  }
               ],
               "returned":1
            },
            "urls":[  
               {  
                  "type":"detail",
                  "url":"http://marvel.com/comics/characters/1011..."
               },
               ...
            ]
         },
```

We could collect the character names, ids and create the thumbnail links and send only these to the app.
Or just forward the whole thing and let the app decide what to show.  Since this is just an exercise, let's go with the latter.

Just for fun we looked at the names:
```
3-D Man
A-Bomb (HAS)
A.I.M.
Aaron Stack
Abomination (Emil Blonsky)
Abomination (Ultimate)
Absorbing Man
Abyss
Abyss (Age of Apocalypse)
Adam Destine
Adam Warlock
Aegis (Trey Rollins)
Agent Brand
Agent X (Nijo)
Agent Zero
Agents of Atlas
Aginar
Air-Walker (Gabriel Lan)
Ajak
Ajaxis
```

The thumbnail apparently would be another API call like this:
```
http://i.annihil.us/u/prod/marvel/i/mg/c/e0/535fecbbb9784
```

The data model looks like this:
```
"id" : 1011334,
"name" : 3-D Man,
"description" : ,
"modified" : 2014-04-29T14:18:17-0400,
"thumbnail" : -{
  "path" : http://i.annihil.us/u/prod/marvel/i/mg/c/e0/535fecbbb9784,
  "extension" : jpg
},
"resourceURI" : http://gateway.marvel.com/v1/public/characters/1011334,
"comics" : +{ ... },
"series" : +{ ... },
"stories" : +{ ... },
"events" : +{ ... },
"urls" : +{ ... },
```

So, I'm guessing we will need to provide a get thumbnail endpoint to get those, as they would have the same restrictions as the other server side calls with the hash, and keys, etc.


### The in-memory caches

We will use [this repo](https://www.npmjs.com/package/memory-cache) to same time.

It was a simple case to use it.  Right now it is in the server.js file.  It might be better to move it into another file and use it as middleware for all requests.

Another improvement would be to add an expiration time so that the data could be refreshed on a schedule, or let the calling party dictate how long to keep the data.  If we want to start letting the user query particular characters or other details, this might be more of an issue.  As of now, I don't think they will be adding characters too often.
a
### The Key Vault

The Azure [Key Vault](https://docs.microsoft.com/en-us/azure/key-vault/about-keys-secrets-and-certificates) feature might be what we need.

The npm package [azure-keyvault](https://www.npmjs.com/package/azure-keyvault) comes up in a google search, but isn't in the docs shown above.  Why not skip reading about that and just use the package?

Although I can't get an idea of how this security works for a private key.
Part to the example code:
```
var clientId = "<to-be-filled>";
var clientSecret = "<to-be-filled>";
var vaultUri = "<to-be-filled>";
```

First of all, they are using var in their documentation.  C'mon, this is Node, not a browser.

Where are the instruction on how to ssh into the environment and set the secrets?   Where is the wizard to do it online?  Back to the first [docs](https://azure.microsoft.com/en-us/resources/samples/key-vault-node-getting-started/):  *The quickstart uses Node.js and Managed service identities (MSIs)*

The steps are:
1. Create a Key Vault.
2. Store a secret in Key Vault.
3. Retrieve a secret from Key Vault.
4. Create an Azure Web Application.
5. Enable managed service identities.
6. Grant the required permissions for the web application to read data from Key vault.

Since we are not going to be doing this in the client (as yet), we only need steps 1-3.  This dance requires the Aure CLI 2.0.4 or later.

We haven

I'm pretty sure I created a resource group before, at least for the website deployment.  Anyhow, I can't find any record of it.  Looking at this command, I'm sure this was done before:
```
az keyvault create --name "<YourKeyVaultName>" --resource-group "<YourResourceGroupName>" --location "East US"
```

Specifically I can remember think I need to change that location (Sydney, Australia here), and then forgetting to and going with the East Coast instead of trying to undo it.

Connected to our DevOps pipeline, there are no task groups and no deployment groups on the project Azure page.

Our notes here remind us that this was the second of the Azure projects:
*the previous Azure hello world app where linting and testing was added and deployed to an App Services container.*

So is that why we remember creating a group?  There must be a way to find out what the name of the resource group is.  Open up a 'Power Shell' and run:
```
Get-AzureRmResourceGroup
ResourceGroupName : cloud-shell-storage-southeastasia
Location          : southeastasia
ProvisioningState : Succeeded
Tags              :
ResourceId        : /subscriptions/ad130dfc-ad9f-4c52-adf9-ea9bfa736
                    70e/resourceGroups/cloud-shell-storage-southeast
                    asia

ResourceGroupName : myResourceGroup
Location          : southcentralus
ProvisioningState : Succeeded
Tags              :
ResourceId        : /subscriptions/ad130dfc-ad9f-4c52-adf9-ea9bfa736
                    70e/resourceGroups/myResourceGroup
```

That looks like the context of the shell, not this app.  Trying this:
```
$ az resource list
[
  {
    "id": "/subscriptions/ad130dfc-ad9f-4c52-adf9-ea9bfa73670e/resourceGroups/cloud-shell-storage-southeastasia/providers/Microsoft.Storage/storageAccounts/cs1ad130dfcad9fx4c52xadf",
    "identity": null,
    "kind": "Storage",
    "location": "southeastasia",
    "managedBy": null,
    "name": "cs1ad130dfcad9fx4c52xadf",
    "plan": null,
    "properties": null,
    "resourceGroup": "cloud-shell-storage-southeastasia",
    "sku": {
      "capacity": null,
      "family": null,
      "model": null,
      "name": "Standard_LRS",
      "size": null,
      "tier": "Standard"
    },
    "tags": {
      "ms-resource-usage": "azure-cloud-shell"
    },
    "type": "Microsoft.Storage/storageAccounts"
  },
  {
    "id": "/subscriptions/ad130dfc-ad9f-4c52-adf9-ea9bfa73670e/resourceGroups/myResourceGroup/providers/Microsoft.Web/serverFarms/myAppServicePlan",
    "identity": null,
    "kind": "app",
    "location": "southcentralus",
    "managedBy": null,
    "name": "myAppServicePlan",
    "plan": null,
    "properties": null,
    "resourceGroup": "myResourceGroup",
    "sku": {
      "capacity": 0,
      "family": "F",
      "model": null,
      "name": "F1",
      "size": "F1",
      "tier": "Free"
    },
    "tags": null,
    "type": "Microsoft.Web/serverFarms"
  },
  {
    "id": "/subscriptions/ad130dfc-ad9f-4c52-adf9-ea9bfa73670e/resourceGroups/myResourceGroup/providers/Microsoft.Web/sites/strumosa",
    "identity": null,
    "kind": "app",
    "location": "southcentralus",
    "managedBy": null,
    "name": "strumosa",
    "plan": null,
    "properties": null,
    "resourceGroup": "myResourceGroup",
    "sku": null,
    "tags": null,
    "type": "Microsoft.Web/sites"
  }
]
```

So it's either myResourceGroup or strumosa.  Lets try the first one first.  This is the command:
```
az keyvault create --name "<YourKeyVaultName>" --resource-group "<YourResourceGroupName>" --location "East US"
```

So trying this to create the vault:
```
az keyvault create --name strumosa_keyvault --resource-group myResourceGroup --location southcentralus
```

First tried I tried to set the secret, got this:
```
Parameter 'secret_name' must conform to the following pattern: '^[0-9a-zA-Z-]+$'.
```

Trying again with a conformant name and got:
```
az keyvault secret set --vault-name private_vault --name marvelPrivateKey --value "none of your biz"
Max retries exceeded attempting to connect to vault. The vault may not exist or you may need to flush your DNS cache and try again later.
```

That happened twice.  Couldn't find any docs on how to flush the DNS cache.  It seemed to be a source of pain for some other users.  To view the value contained in the secret as plain text:
```
az keyvault secret show --name marvelPrivateKey --vault-name private_vault
```

However, this gives the same error.  [This may be the solution](https://github.com/Azure/azure-cli/issues/3348), but for now, since the key was already pushed, it's time to move on witht the clien.  I committed to the dev branch and pushed before removing the key.  For some reason, Azure pushed the dev branch thru the pipe and deployed it.  So, the damage is done.  We can get a new secret later and do things correctly when the vault comes back to life.



### The images

The [docs](https://developer.marvel.com/documentation/images) state: *To build a full image path from an image representation*

1. Take the "path" element from the image representation
2. Append a variant name to the path element
3. Append the "extension" element to the variant name

So if you're curious about what 3-D man looks like:
http://i.annihil.us/u/prod/marvel/i/mg/c/e0/535fecbbb9784,
+ portrait_xlarge
+ .jpg
= http://i.annihil.us/u/prod/marvel/i/mg/c/e0/535fecbbb9784/portrait_xlarge.jpg

The types are portrait, square and landscape.  May as well use the portrait, in which case we need this info:
```
Portrait aspect ratio
portrait_small	50x75px
portrait_medium	100x150px
portrait_xlarge	150x225px
portrait_fantastic	168x252px
portrait_uncanny	300x450px
portrait_incredible	216x324px
```

#
## Static Analysis with Sonarqube

The best practices guide recommended two libraries for static analysis; Sonarqube or Code Climate.  Starting with Sonarqube, the JavaScript version is [SonarJS](https://github.com/SonarSource/SonarJS).

The getting started page says *SonarJS is integrated inside of SonarLint IDE extension. It is available for WebStorm/IntelliJ, Visual Studio, VS Code, Atom and Eclipse.*  You can also use it in the cloud or what seems to be a desktop app.  We went with the cloud option for now.  There was an option for Azure as well.  Not sure why that one wasn't chosen...

Added the following path to the sonar-scanner command:
```
Users/tim/node/sonar-scanner-3.3.0.1492-macosx/bin
```

There is a [sample project](https://github.com/SonarSource/sonar-scanning-examples/blob/master/sonarqube-scanner/src/javascript/Person.js) with JavaScript.  It shows code that smells and reasons.

There is a list of JS code examples with non-compliant code with messages such as;
```
always false
dead code
statements that are not necessarily true
empty strings
```

This is the command to start the server:
```
sonar-scanner \
  -Dsonar.projectKey=timofeysie_strumosa-pipe \
  -Dsonar.organization=timofeysie-github \
  -Dsonar.sources=. \
  -Dsonar.host.url=https://sonarcloud.io \
  -Dsonar.login=<key>
```

The initial run included files that shouldn't be included, such as ```coverage/app/compact.js.html```.

The results of the run can be seen on [a dashboard](https://sonarcloud.io/dashboard?id=timofeysie_strumosa-pipe).

The bad news is: 140 issues - 1d 2h effort

The good news is, that's work for the Istanbul developers who make the app which generates the coverage report.

Just an example, the first one says:
```
Remove this deprecated "name" attribute.
```

That is referring to this line of code:
```
<meta name="viewport" content="width=device-width, initial-scale=1">
```

On the dashboard, we can see that our code is looking pretty good:
```
File        Lines of Code	Bugs	Vulnerabilities	Code Smells	Coverage	Duplications
app	        21              0       0               0           0.0%        0.0%
coverage    1,742           1       0               128         0.0%        21.1%
node_mod... 4,403           7       0               4                       3.2%
tests	    53              0       0               0           0.0%        72.3%
gulpfile.js	19              0       0               0           0.0%        0.0%
server.js	27              0       0               0           0.0%        0.0%
```

Should we let the Istanbul devs know?  No, lets just move on.  The files to scan are listed in the sonar-project.properties file:
```
# Path is relative to the sonar-project.properties file. Replace "\" by "/" on Windows.
# This property is optional if sonar.modules is set.
sonar.sources=.
```

Replacing the ```.``` with ```server.js,src/*``` seems like the right way to go.  That didn't seem to take effect.  The result of the next run is the same.  Maybe sonar.modules is set?  There is no occurance of that string in the project.

The [docs](https://docs.sonarqube.org/latest/analysis/analysis-parameters/) say:
```
Project Configuration
Key: sonar.sources
Description: Comma-separated paths to directories containing source files.
Default: Read from build system for Maven, Gradle, MSBuild projects
```

After reading [this SO answer](https://stackoverflow.com/questions/21323276/sonarqube-exclude-a-directory), trying a new property:
```
sonar.exclusions=node_modules/**, coverage/**,  TEST-RESULTS.xml, gulpfile.js
```

But at the start of the run, it looks like that is not working:
```
INFO: 232 files indexed...  (last one was node_modules/loose-envify/LICENSE)
INFO: 489 files indexed...  (last one was node_modules/resolve/test/resolver/cup.coffee)
INFO: 820 files indexed...  (last one was node_modules/read-pkg-up/package.json)
```

Doh!  The command line we used to start sonar had a flag in it:
```
QuinquenniumF:pipelines-javascript tim$ sonar-scanner   -Dsonar.projectKey=timofeysie_strumosa-pipe   -Dsonar.organization=timofeysie-github   -Dsonar.sources=server.js,src ...
```

That gives us an error though:
```
ERROR: Error during SonarQube Scanner execution
ERROR: The folder 'src' does not exist for 'timofeysie_strumosa-pipe' (base directory = /Users/tim/node/azure/pipelines-javascript)
```

Trying this and adding the tests directory:
```
-Dsonar.sources=./server.js,./src,./test
```

But again:
```
ERROR: Error during SonarQube Scanner execution
ERROR: The folder './src' does not exist for 'timofeysie_strumosa-pipe' (base directory = /Users/tim/node/azure/pipelines-javascript)
```

If we ignore that flag and try to get sonar to read the properties file, then we get this error:
```
ERROR: Error during SonarQube Scanner execution
ERROR: You must define the following mandatory properties for 'timofeysie_strumosa-pipe': sonar.sources
```

So back to the flag, this also fails despite being what is recommended in one of the SO answers linked to above:
```
-Dsonar.sources=server.js,src/**,test/**
```

Trying a new approach:
```
-Dsonar.sources=. -Dsonar.exclusions=node_modules/**,coverage/**,TEST-RESULTS.xml,gulpfile.js
```

Happily saw this in the scrolling output from the command:
```
INFO:   Excluded sources: node_modules/**, coverage/**, TEST-RESULTS.xml, gulpfile.js
...
INFO: 10 files indexed...  (last one was LICENSE-CODE)
```

Hooray!  The only issue now is 72.3% code duplication in the tests.  But that has
describe, describe, it, it, expect, expect lines in it.  Maybe sonar is blind to the way tests work.  Maybe we shouldn't be analyzing the test directory.  Another question to bring with the GitHub best practices project.


#
## API Testing

Starting out with Mocha and the Chai expect library, we want to write some tests and then make them pass in good TDD fashion.  Creating a helper function to add two numbers together and testing it was easy enough.  Then writing a test to get the values from an API and right away there is trouble.  All the tests are passing.  They shouldn't be.  I haven't written the server API for it yet, and what's more, the server is not running.  So why are the tests passing?
```
  Calculator API
    Addition
      ✓ returns status 200
response undefined
error { Error: connect ECONNREFUSED 127.0.0.1:3000
    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1117:14)
  errno: 'ECONNREFUSED',
  code: 'ECONNREFUSED',
  syscall: 'connect',
  address: '127.0.0.1',
  port: 3000 }
      ✓ returns two arguments added together

  Demo suite
body undefined
    calculator
      ✓ should add two numbers
```

We are doing this in the first test:
```
expect(response.statusCode).to.equal(200);
done();
```

How can response.statusCode even work if the response is undefined?

Perplexed, I moved on and created the add API and pushed to change to master.  Got our first red bar in the pipeline:
```
NodeTool 1 error 3m 13s
/bin/tar failed with return code: 2
```

In PublishTestResults, a [warning] No test result files matching TEST-RESULTS.xml were found.
That file was removed as we just wanted output to the console instead of an xml file (that's so 2001!).
But the deployment was skipped, so this wont work yet:

http://strumosa.azurewebsites.net/add?arg1=1&arg2=1


So what does error 2 mean?
```
2019-01-28T12:07:06.3646826Z Task         : Node Tool Installer
2019-01-28T12:07:06.3646982Z Description  : Finds or Downloads and caches specified version spec of Node and adds it to the PATH.
...
2019-01-28T12:07:09.9713067Z Downloading: https://nodejs.org/dist/v8.15.0/node-v8.15.0-linux-x64.tar.gz
2019-01-28T12:10:18.7837033Z Extracting archive
2019-01-28T12:10:18.7875172Z [command]/bin/tar xzC /home/vsts/work/_temp/a404ed76-2fd4-4483-a23d-6805c88cee26 -f /home/vsts/work/_temp/fe15c40a-f267-4d85-8071-ecc6b1939196
2019-01-28T12:10:19.4165117Z
2019-01-28T12:10:20.2088486Z gzip: stdin: unexpected end of file
2019-01-28T12:10:20.2088985Z /bin/tar: Unexpected EOF in archive
2019-01-28T12:10:20.2089125Z /bin/tar: Unexpected EOF in archive
2019-01-28T12:10:20.2089407Z /bin/tar: Error is not recoverable: exiting now
2019-01-28T12:10:20.2146988Z ##[error]/bin/tar failed with return code: 2
```

Except for the passing failed tests, the API works locally as expected:
```
http://localhost:3000/add?arg1=1&arg2=2
```

This might be because we are using a starter app that relies partly on the reporting done from the test command.  It's just an idea.  The error might also be just a failed download.  But it seems I can't just rerun or restart the pipe.

Will put the coverage back in and try again.  Made a spelling mistake in the commit message.  I hate that.  Should add a spell checker to the pipeline.

Anyhow, after putting back the nyc reporting and corbertura coverage, etc, the NodeTool doesn't fail:
```
nyc --reporter=cobertura
    --reporter=html ./node_modules/.bin/mocha tests/**/*.js
    --reporter mocha-junit-reporter
    --reporter-options mochaFile=./TEST-RESULTS.xml"
}
```

Our API works.  Now to get the tests to be real.  The successful test report from the pipeline run:
```
2019-01-28T12:29:10.6265297Z ; cli configs
2019-01-28T12:29:10.6265624Z metrics-registry = "https://registry.npmjs.org/"
2019-01-28T12:29:10.6265760Z scope = ""
2019-01-28T12:29:10.6266022Z user-agent = "npm/6.4.1 node/v8.15.0 linux x64"
2019-01-28T12:29:10.6266141Z
2019-01-28T12:29:10.6266211Z ; environment configs
2019-01-28T12:29:10.6266367Z userconfig = "/home/vsts/work/1/npm/5.npmrc"
2019-01-28T12:29:10.6266421Z
2019-01-28T12:29:10.6266566Z ; node bin location = /opt/hostedtoolcache/node/8.15.0/x64/bin/node
2019-01-28T12:29:10.6266657Z ; cwd = /home/vsts/work/1/s
2019-01-28T12:29:10.6266775Z ; HOME = /home/vsts
2019-01-28T12:29:10.6267498Z ; "npm config ls -l" to show all defaults.
2019-01-28T12:29:10.6267630Z
2019-01-28T12:29:10.6267931Z [command]/opt/hostedtoolcache/node/8.15.0/x64/bin/npm test
2019-01-28T12:29:12.1304220Z
2019-01-28T12:29:12.1305119Z > HelloWorld@0.0.0 test /home/vsts/work/1/s
2019-01-28T12:29:12.1306212Z > nyc --reporter=cobertura --reporter=html ./node_modules/.bin/mocha tests/**/*.js --reporter mocha-junit-reporter --reporter-options mochaFile=./TEST-RESULTS.xml
2019-01-28T12:29:12.1306574Z
2019-01-28T12:29:12.1306757Z body undefined
```

The body comment should be the body of the result, which should be "2" after adding 1 + 1.  So here again we see passing failing tests.

Two hints here.  All the async tests pass, but if you assert the wrong result for the actual demo.js package test, the test fails as expected.

Also, the console log outputs always get printed in a slightly different order.  So it's an async problem.  Switched expect from chai to chai-as-promised but that didn't change anything.





### Error handling best practices

Async-await instead enables a much more compact code syntax like try-catch.
```
var userDetails;
function initialize() {
    // Setting URL and headers for request
    var options = {
        url: 'https://api.github.com/users/narenaryan',
        headers: {
            'User-Agent': 'request'
        }
    };
    // Return new promise
    return new Promise(function(resolve, reject) {
     // Do async job
        request.get(options, function(err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(body));
            }
        })
    })
}
```
[[source](https://medium.com/@tkssharma/writing-neat-asynchronous-node-js-code-with-promises-async-await-fa8d8b0bcd7c)]

Trying to implement a compact server endpoint and properly layered error handling results in our first linting issue.  This line:
```
  const user = req.query.user;
```

Results in this linting error:
```
 24:9   error    Use object destructuring         prefer-destructuring
```

For those that don't know, destructuring is a convenient way of extracting multiple values from data stored in objects and Arrays. It can be used in locations that receive data (such as the left-hand side of an assignment).

The example from [10.1.1 Object destructuring](http://exploringjs.com/es6/ch_destructuring.html)
```
const obj = { first: 'Jane', last: 'Doe' };
const {first: f, last: l} = obj;
    // f = 'Jane'; l = 'Doe'
// {prop} is short for {prop: prop}
const {first, last} = obj;
    // first = 'Jane'; last = 'Doe'
```

Destructuring helps with processing return values:
```
const obj = { foo: 123 };
const {writable, configurable} =
    Object.getOwnPropertyDescriptor(obj, 'foo');
console.log(writable, configurable); // true true
```

I've done destructuring with arrays, which is a little more obvious.  Without thinking too much, this seems the way to go:
```
  const { user } = req;
```

This makes the linter happy.  Lets see how the test runs.

```
(node:37771) UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: 4): TypeError: name must be a string to req.get
```

That's great.  We need this:
```
const { name } = req.query;
compact.run(name, req).then((result) => {
    ...
}).catch((error) => {
    ...
})
```

Actually, that error was not from our tests, which are all passing (when they shouldn't be), it's from the server.  Anyhow, the desctructured name above works fine.  After catching the error, we have:
```
error TypeError: name must be a string to req.get
```

Actually, I don't get it.  The line is:
```
    request.get(options, (err, resp, body) => {
```

They have abbreviated request for us.  The problem turned out to be the request we were treating like the Express app.  Since we're making a new request to GitHub, we needed our own API call and used the request package that is used in the unit tests.

This works, but we get the error:
```
  1:17  error  'request' should be listed in the project's dependencies, not devDependencies  import/no-extraneous-dependencies
```

This strict linting is great!  Might not have caught that otherwise.  Or should we be importing and creating another Express app to make the call from?




### Use async/await and promises

Add some helper functions
```
throwError = (code, errorType, errorMessage) => error => {
  if (!error) error = new Error(errorMessage || 'Default Error')
  error.code = code
  error.errorType = errorType
  throw error
}
throwIf = (fn, code, errorType, errorMessage) => result => {
  if (fn(result)) {
    return throwError(code, errorType, errorMessage)()
  }
  return result
}
sendSuccess = (res, message) => data => {
  res.status(200).json({type: 'success', message, data})
}
sendError = (res, status, message) => error => {
  res.status(status || error.status).json({
    type: 'error',
    message: message || error.message,
    error
  })
}
// handle both Not Found and Error cases in one command
const user = await User
  .findOne({where: {login: req.body.login}})
  .then(
    throwIf(r => !r, 400, 'not found', 'User Not Found'),
    throwError(500, 'sequelize error')
  )
//<-- After that we can use `user` variable, it's not empty
```
[[source](https://codeburst.io/node-express-async-code-and-error-handling-121b1f0e44ba)]



#
## Linting

Among the best practices are the basics of linting, as we as security-related linter plugins such as eslint-plugin-security.  We will want to embrace it all to keep our code as clean as possible with the least effort as possible.


The standard is [ESlint](https://eslint.org/docs/developer-guide/nodejs-api).  Setting it up goes something like this.

```
npm install eslint --save-dev
./node_modules/.bin/eslint --init
-bash: /node_modules/.bin/eslint: No such file or directory
npm run lint -- --init
? How would you like to configure ESLint? Use a popular style guide
? Which style guide do you want to follow?
❯ Airbnb (https://github.com/airbnb/javascript)
  Standard (https://github.com/standard/standard)
  Google (https://github.com/google/eslint-config-google)
```

Airbnb standard or Google?
*If you prefer a lighter touch from your linter, Google is probably the best choice. If you are interested in having a strongly opinionated linter that provides additional validation and React support out of the box, AirBnB is the style guide for you.* ([source](https://medium.com/@uistephen/style-guides-for-linting-ecmascript-2015-eslint-common-google-airbnb-6c25fd3dff0)).

I chose Google for the initial project since this server app might be used with Angular.  If it was React then I would have gone for Airbnb.  

One difference in the setup from this project and the first Azure hello world project was this error:
```
Oops! Something went wrong! :(
ESLint: 5.12.1.
No files matching the pattern "node_modules/ipaddr.js" were found.
Please check for typing mistakes in the pattern.
```

After a quick google, the solution was to escape the pattern matcher:
```
"lint": "eslint \"**/*.js\" --fix",
```

Running the linter for the first time results in the first project produced this output:
```
$ npm run lint
> app-service-hello-world@0.0.1 lint /Users/tim/node/azure/nodejs-docs-hello-world-master
> eslint **/*.js
/Users/tim/node/azure/nodejs-docs-hello-world-master/index.js
   1:1   error  Unexpected var, use let or const instead      no-var
   3:1   error  Unexpected var, use let or const instead      no-var
   4:1   error  Expected indentation of 2 spaces but found 4  indent
   4:30  error  Strings must use singlequote                  quotes
   4:46  error  Strings must use singlequote                  quotes
   5:1   error  Expected indentation of 2 spaces but found 4  indent
   5:18  error  Strings must use singlequote                  quotes
   8:1   error  Unexpected var, use let or const instead      no-var
  11:13  error  Strings must use singlequote                  quotes
✖ 9 problems (9 errors, 0 warnings)
  6 errors and 0 warnings potentially fixable with the `--fix` option.
npm ERR! Darwin 18.2.0
npm ERR! argv "/Users/tim/.nvm/versions/node/v6.9.2/bin/node" "/Users/tim/.nvm/versions/node/v6.9.2/bin/npm" "run" "lint"
npm ERR! node v6.9.2
npm ERR! npm  v3.10.9
npm ERR! code ELIFECYCLE
npm ERR! app-service-hello-world@0.0.1 lint: `eslint **/*.js`
npm ERR! Exit status 1
npm ERR!
npm ERR! Failed at the app-service-hello-world@0.0.1 lint script 'eslint **/*.js'.
```

Since the reporting is set for errors not warnings, npm exits.  Probably we want to change this.
First of all, any lib using var in 2019 has problems.  So right out of the box I am questioning Microsoft's ability to keep up.  Yes, they made VSCode which I'm using right now.  But that's one team out of many.  The people running Azure don't pay much attention to NodeJS to ship an example app using var.

Rant over.  I would prefer tabs of 4 spaces but couldn't easily figure out how to modify the Google style guide and am not that attached to it.  Single quotes, of course.

But still getting this error:
```
  3:1  error  Parsing error: The keyword 'const' is reserved
```

Changed const to let and got this error:
```
  1:5  error  Parsing error: Unexpected token http
```

This [SO](https://stackoverflow.com/questions/36001552/eslint-parsing-error-unexpected-token) answer says unexpected token errors in ESLint parsing occur due to incompatibility between the development environment and ESLint's current parsing capabilities with the ongoing changes with JavaScripts.

As of now, we cannot ignore this setting as it is in some Google file we will have to find.

The recommended fix for the const keyword error is this in the eslintrc file:
```
{
    "parserOptions": {
        "ecmaVersion": 2017
    },

    "env": {
        "es6": true
    }
}
```

But this doesn't work for us.
Then I realized that my answer to use a JS style of lint file in the init process created another .eslintrc file with a .js extension, and my changes the the .eslintrc were not taking effect.  Removed the Google styles and configured them manually and now it works.

Next is making it run as part of a build pipeline.

But when adding Jest testing, it was decided to go with Airbnb after all for its super strict approach.  This was done using this command:
```
npx install-peerdeps --dev eslint-config-airbnb-base
```

We changed the ```.eslintrc.js``` file to include the Jest plugin.  After the first run we get this:
```
/Users/tim/node/azure/nodejs-docs-hello-world-master/index.js
   3:34  warning  Unexpected unnamed function                       func-names
   3:34  error    Unexpected function expression                    prefer-arrow-callback
   3:42  error    Missing space before function parentheses         space-before-function-paren
   4:1   error    Expected indentation of 2 spaces but found 1 tab  indent
   4:2   error    Unexpected tab character                          no-tabs
   4:26  error    A space is required after '{'                     object-curly-spacing
   4:55  error    A space is required before '}'                    object-curly-spacing
   5:1   error    Expected indentation of 2 spaces but found 1 tab  indent
   5:2   error    Unexpected tab character                          no-tabs
  11:1   warning  Unexpected console statement                      no-console
✖ 10 problems (8 errors, 2 warnings)
  6 errors and 0 warnings potentially fixable with the `--fix` option.
```

Wow, that is super strict.  Changing this
```
http.createServer(function(request, response) {
```

To this
```
http.createServer((request, response) => {
```

Got us down to ```7 problems (6 errors, 1 warning)```.  Going to try the --fix option now.
```
  11:1  warning  Unexpected console statement  no-console
✖ 1 problem (0 errors, 1 warning)
```

That was great.  Might leave that flag in the package.json script for good.

Another thing we need to do is create the src directory and move our code there.  That's a basic best practice.  But, not sure how having the index file in a sub directory will affect our Azure deployment, so going to hold off on moving the index file there for now.  Everything else can go there.

Here is a list of the AirBnB linting requirements:
* Semicolon: Required
* Trailing Commas: Required
* Template strings: Prefer
* Import Extensions: None
* Space before function parentheses: None
* Object Curly Spacing: Yes
* Array Bracket Spacing: None
* Underscored functions: None
* Object Destructuring: Prefer
* React Ordering: Opinionated
* React Prop Validation: Required
* Arrow Functions Return Assignment: No
* Object Property Shorthand: Prefer

Back to the current pipeline project, the first run of the linter produced pages and pages of output.
```
/Users/tim/node/azure/pipelines-javascript/app/demo.js
  1:15  warning  Unexpected unnamed function  func-names
/Users/tim/node/azure/pipelines-javascript/coverage/block-navigation.js
  12:35  error  'document' is not defined  no-undef
  50:5   error  Expected a default case    default-case
  63:1   error  'window' is not defined    no-undef
/Users/tim/node/azure/pipelines-javascript/coverage/prettify.js
   1:1     error    'window' is not defined                                                    no-undef
   1:44    warning  Unexpected unnamed function          
...
```   

Obviously we only want our src to be linted.  We do have an app directory, but how can we add one file outside that, namely the server.js file?  Just try and add both like this:
```
> eslint server.js "./app/**/*.js" --fix
/Users/tim/node/azure/pipelines-javascript/server.js
  19:3  warning  Unexpected console statement  no-console
  25:1  warning  Unexpected console statement  no-console
/Users/tim/node/azure/pipelines-javascript/app/demo.js
  1:15  warning  Unexpected unnamed function  func-names
✖ 3 problems (0 errors, 3 warnings)
```


Works on the first try.  Lucky guess.

When we do our next push to master, we get the following on our eslint task:
```
Unknown command: eslint server.js \"./app/**/*.js\"
```

Our task is a little simplistic and naive:
```
- task: Npm@1
  displayName: 'eslint'
  inputs:
    command: eslint server.js \"./app/**/*.js\"
```

That's pretty much what the npm install task looks like.  But since there are paths involved, maybe the copy files is the best one to base the linting task on:
```
- task: CopyFiles@2
  inputs:
    command: eslint
    SourceFolder: '$(System.DefaultWorkingDirectory)'
    Contents:  **\*.js
    TargetFolder: '$(Build.ArtifactStagingDirectory)'
```

This time, the build failed on the first task:
```
/azure-pipelines.yml: (Line: 20, Col: 15, Idx: 422) - (Line: 20, Col: 16, Idx: 423): While scanning an anchor or alias, did not find expected alphabetic or numeric character.
```

Have to actually read the docs instead of just guessing.  Also, I'm not sure if it's even a good idea to lint in a pipeline like this.  Especially with the --fix flag.  Is it really going to write back to the js files if there is an issue it can fix?  It seems like linting might be only appropriate as a developer workflow.  Have to find our what others do.


#
## Node Best practices

In an effort to better define the code in the server app, we're going to be applying the Node best practices described [here](https://github.com/i0natan/nodebestpractices).  Below are some notes to get started with.

Linting, testing, coverage, deploying are all well underway and working well.

Still to be done, separate Express definitions to at least two files:
1. the API declaration (app.js)
2. the networking concerns (WWW).

Locate API declarations within components.

Test should run when a developer saves or commits a file, full end-to-end tests usually run when a new pull request is submitted

Tagging tests with keywords like #cold #api #sanity so you can grep with your testing harness and invoke the desired subset. For example, this is how you would invoke only the sanity test group with Mocha: mocha --grep 'sanity'

Static analysis with Sonarqube or Code Climate.

Delegate anything possible (e.g. static content, gzip) to a reverse proxy.  Options are nginx, HAproxy, S3, CDN.

Create a ‘maintenance endpoint’ for system-related information, like memory usage and REPL, etc in a secured API.

Use of security-related linter plugins such as eslint-plugin-security



### Code structure

Put modules/libraries in a folder, place an index.js file that exposes the module's internals so every consumer will pass through it. This serves as an 'interface' and eases future changes without breaking the contract.

Instead of this:
```
module.exports.SMSProvider = require('./SMSProvider/SMSProvider.js');
module.exports.SMSNumberResolver = require('./SMSNumberResolver/SMSNumberResolver.js');
```

Do this:
```
module.exports.SMSProvider = require('./SMSProvider');
module.exports.SMSNumberResolver = require('./SMSNumberResolver');
```

Component folder example
```
index
model
modelAPI
modelController
modelDAL
modelError
modelService
modelTesting
```

Separate the Express definition to at least two files:
1. the API declaration (app.js)
2. the networking concerns (WWW).

Locate API declarations within components.

keys can be read from file and from environment variable.
secrets are kept outside committed code
config is hierarchical for easier findability.
(example packages: rc, nconf and config)


### 1.2 Layer your components, keep Express within its boundaries
*Each component should contain 'layers' - a dedicated object for the web, logic and data access code. This not only draws a clean separation of concerns but also significantly eases mocking and testing the system. Though this is a very common pattern, API developers tend to mix layers by passing the web layer objects (Express req, res) to business logic and data layers - this makes your application dependant on and accessible by Express only Otherwise: App that mixes web objects with other layers can not be accessed by testing code, CRON jobs and other non-Express callers.*

Don’t: API passes ‘Express’ object such as request to DAL & logic layers.  The entire system becomes dependant on an accessible only by Express.  The app is then less testable.  All app functions accept a req object.
```
var express = require('Express'),
    util = require ('util'),
    router = express.Router(),
    usersDBAccess = require('./usersDAL');
router.get('/', (req, res, next) => {
    usersDBAccess.getByID(req);
});
module.exports = router;
```

Do: Create and pass a custom context object.  Testable and accessible by all.  Keep Express in the web layer only.
```
var express = require('Express'),
    util = require ('util'),
    router = express.Router(),
    usersService = require('./usersService'),
    usersDBAccess = require('./usersDAL'),
    logger = require('logger');
router.get('/', (req, res, next) => {
    const contextObject = {
        user: req.user,
            transactionId: UUID.new(),
            otherProperties: 'some other properties'
    };
    new DAL(contextObject);
    usersDBAccess.getByID(1);
});
module.exports = router;
```


### CI Choices

These were notes from the previous Azure hello world app where linting and testing was added and deployed to an App Services container.  Obviously we went with the DevOps pipeline, but this discussion is still relevant.

A pipeline that includes linting, testing and deployments is a standard feature of the modern DevOps experience.  Our basic choices are:
* Heroku CI Pipeline
* Jenkins - complex setup
* CircleCI - flexible CI pipeline without the burden of managing the whole infrastructure
* Azure DevOps Pipeline - Makes sense for an Azure deployment, but is it free?

I've used Jenkins before, so I'd like to find out more about CircleCI.
*Each project repository has its own build pipeline and generates a Docker image which is pushed to a Docker registry. Finally, it does a commit to the Helm Chart repo in the initial, Staging branch. Separating the Deployment pipeline from the individual projects is a foundational element of larger scale microservice architectures. It provides a clear view and history of a logical part of the application stack, archived in version control.*

After a quick setup with the GitHub repo, and adding a yaml file then pushing to master and starting a build, [a green bar](https://circleci.com/gh/timofeysie) appeared showing success.  But what did it do?  Did the lint and the tests run?  How do we add an Azure deployment now?

Maybe try making it fail and push that?

But before getting more into CircleCI, I'd still like to know about the [Azure Pipelines](https://docs.microsoft.com/en-us/azure/devops/pipelines/apps/cd/deploy-docker-webapp?view=azdevops).  That link shows how to deploy a Docker-enabled app to an Azure Web App using Azure Pipelines for CI.  Their sample project is for .NET, so it's not for us.  For this we need a CI build pipeline that publishes a Docker container image.

When reading the [Azure Pipeline docs](https://github.com/MicrosoftDocs/pipelines-javascript) I saw the link to a deo repo with a Node server implemented with the Express.js, tests for the app (in Mocha) which includes an azure-pipelines.yml file that can be used to build the app.

Now you're talking.  After doing all that we can get back to the CI part in [these docs](https://docs.microsoft.com/en-us/azure/devops/pipelines/apps/cd/deploy-docker-webapp?view=azdevops).

Cloning into [the repo](https://github.com/MicrosoftDocs/pipelines-javascript) in a separate directory now.


### Testing

Test should run when a developer saves or commits a file, full end-to-end tests usually run when a new pull request is submitted

Tagging tests with keywords like #cold #api #sanity so you can grep with your testing harness and invoke the desired subset. For example, this is how you would invoke only the sanity test group with Mocha: mocha --grep 'sanity'

For the Azure web app before setting up the pipe we used Jest.  After implementing the pipeline which came with a project setup using Mocha, that became the unit testing framework which can be seen in the app right now.

Implementing Jest with a first demo run produces this result:
```
$ npm run test
> app-service-hello-world@0.0.1 test /Users/tim/node/azure/nodejs-docs-hello-world-master
> jest src
 PASS  src/demo/sum.test.js (26.78s)
  ✓ adds 1 + 2 to equal 3 (5ms)
Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        52.654s
Ran all test suites matching /src/i.
```

Jest also comes with coverage which also runs the tests.  That's easier than having to setup Istanbul or NYC or something else.
```
$ npm run coverage
> app-service-hello-world@0.0.1 coverage /Users/tim/node/azure/nodejs-docs-hello-world-master
> jest --collectCoverageFrom=src/**.js --coverage src
 PASS  src/demo/sum.test.js (25.862s)
  ✓ adds 1 + 2 to equal 3 (6ms)
----------|----------|----------|----------|----------|-------------------|
File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
----------|----------|----------|----------|----------|-------------------|
All files |        0 |        0 |        0 |        0 |                   |
----------|----------|----------|----------|----------|-------------------|
Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        65.804s
Ran all test suites matching /src/i.
```

How is it faster to run coverage with tests than just tests alone?  Anyhow, why is there zero coverage?


### Code coverage tools

Like
```
Istanbul
NYC
Corbertura
```
The initial project used Jest for testing which comes with its own coverage tools.  That seems like all we need.  If we can set up Jest again and ditch Mocha without breaking the build, will try that again.  
If we can use

### Static analysis

Tools for the CI build should fail when it finds code smells.
For example, detect duplications, perform advanced analysis (e.g. code complexity) and follow the history and progress of code issues.

Options:
```
Sonarqube (2,600+ stars)
Code Climate (1,500+ stars)
```


### Delegate anything possible (e.g. static content, gzip) to a reverse proxy

Options:
* nginx
* HAproxy
* S3
* CDN

*It’s very tempting to cargo-cult Express and use its rich middleware offering for networking related tasks like serving static files, gzip encoding, throttling requests, SSL termination, etc. This is a performance kill due to its single threaded model which will keep the CPU busy for long periods (Remember, Node’s execution model is optimized for short tasks or async IO related tasks). A better approach is to use a tool that has expertise in networking tasks – the most popular are nginx and HAproxy.*

*Attempting to have Node deal with all of the complicated things that a proven web server does really well is a bad idea.  This is just for one request, for one image and bearing in mind this is the memory that the application could be used for important stuff.*

This connects with *5.11. Get your frontend assets out of Node*

Serve frontend content using dedicated middleware.

Limit the body size of incoming requests on the edge (e.g. firewall, ELB) or by configuring express body parser to accept only small-size payloads


### Be stateless, kill your Servers almost every day

This is part 5.12..  It's what AWS Lambda enforces, right?


### Create a ‘maintenance endpoint’

Expose a set of system-related information, like memory usage and REPL, etc in a secured API.


### Embrace linter security rules

use of security-related linter plugins such as eslint-plugin-security

## Errata

An [example](https://github.com/i0natan/nodejs-course/blob/master/examples/express/express-basic-middleware/end.js) from the author of the best practices guide.
```
// upstream middleware: before API endpoint
app.use((req, res, next) => {
  ...
  next();
});
// API endpoint: is a special kind of middleware
router.post("/api/products", (req, res, next) => {
  ...
  next();
});
app.use(router);
// downstream middleware: after API endpoint
app.use((req, res, next) => {
  ...
  next();
});
```


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

After a push to master, we see our new badge (yay!) but the CopyFiles task is still pending after 9 minutes.  After 12m 10s the tasks all say successful.

So where did the deployment go?  What we want is it to go to an Azure App Service.  After looking around many of the links on the dev.azure.com portal, I'm still not able to find this out.  [This SO answer](https://stackoverflow.com/questions/39905758/where-is-system-defaultworkingdirectory-set-for-builds-in-tfs2015) shows an old 2016 dashboard with a variables view.  Doing a search on our dashboard returns *No work items found for 'variables' with applied filters*.  Great.

After the *[Next Steps](https://docs.microsoft.com/en-us/azure/devops/pipelines/get-started-yaml?view=azdevops#next-steps)* section from the Azure DevOps Pipeline tutorial, there is a link under the NodeJS one that took us back to the main tutorial used to get here.

To run your pipeline in a container, see [Container jobs](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/container-phases?view=azdevops).  But this says it's for more serious deployments when you want to use containers instead of standard deployments.  What we want is the standard straightforward way to push to our app service.  The page does say *deployment group jobs are not yet supported in YAML*.  Good to find that out now.

There is a [Deploy a web app](https://docs.microsoft.com/en-us/azure/devops/pipelines/languages/javascript?view=azdevops&tabs=yaml#deploy-a-web-app) section in the main tutorial.  It has an ArchiveFiles task.  But we already have the ArchiveFiles task.  There is a link after that [to publish this archive to a web app](https://docs.microsoft.com/en-us/azure/devops/pipelines/targets/webapp?view=azdevops).

This is the tutorial where it has the [.NET example](https://github.com/MicrosoftDocs/pipelines-dotnet-core).  Not going to help our NodeJS app, unless the yaml file shows how it's done.  It's work skimming this page to see if we can learn enough to make this last step in our pipeline.

This is the task shown:
```
- task: AzureRmWebAppDeployment@3
  inputs:
    azureSubscription: '<Azure service connection>'
    WebAppName: '<Name of web app>'
    Package: $(System.ArtifactsDirectory)/**/*.zip
```

It's work creating a new service like yesterday and filling that in here.  Then we can leave the currently working strumosa project alone.  Call is strumosa-app?

First continue skimming.  There is a JS section with this taks:
```
- task: AzureRmWebAppDeployment@3
  inputs:
    azureSubscription: '<Azure service connections>'
    WebAppName: '<Name of web app>'
    Package: '$(System.DefaultWorkingDirectory)'
    GenerateWebConfig: true
    WebConfigParameters: '-Handler iisnode -NodeStartFile server.js -appType node'
```

The notes still say that for a NodeJS app you publish the entire contents of your working directory to the web app.  At least it's not the user zipping and uploading the entire project in this case, but it still seems like an anti-pattern to do deployments like that.

To make this work, we need to figure out what *Azure service connections* are.  This is another tangent starting with another web page in the [deployments section](https://docs.microsoft.com/en-us/azure/devops/pipelines/targets/webapp?view=azdevops&tabs=yaml#endpoint) of the Azure DevOps documentation.  It says *the Azure service connection stores the credentials to connect from Azure Pipelines*.  This section then links to another page title [Create an Azure service connection](https://docs.microsoft.com/en-us/azure/devops/pipelines/library/connect-to-azure?view=azdevops).  This says we need a *Azure Resource Manager service*.  These are managed in the DevOps/Project Settings/Service connections section of the portal.

While following those directions, this error came up in the modal:
*Could not authenticate to Azure Active Directory. If a popup blocker is enabled in the browser, disable it and try again.*  It was just trying to open an OAuth login page.  This done and all seems to be working again.

Now we are instructed to use the name we created, strumosa-app, as the azureSubscription value in the task shown above.  To speed things up, lets just try to re-used the strumosa app created yesterday.  This goes in the WebAppName.  Lets do another deployment and see how that goes.

Going back to the portal pipeline builds section to watch the action unfold.  Wait.  It took 12 minutes to complete last time.  Might just go an do something else for a while.

After it's all done, we can check http://strumosa.azurewebsites.net to see if it is now holding our new server app.

And it does.  We now see the server responding with a new response.  One push to master now starts the pipeline which ends in a deployment to master.  We can always use the old strumosa project for other best practices work.  Since it's set up with Airbnb linting and Jest testing and coverage, it's a good place to go to try things out.

Time to create a development branch to do work and test locally and then only push to master when that is all working.


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

The [original starter](https://github.com/MicrosoftDocs/pipelines-javascript) for this project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Legal Notices

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
