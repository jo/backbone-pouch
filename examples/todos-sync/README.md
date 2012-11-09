Mouch — Couchapp Purism
=======================

With [Mouch](http://jo.github.com/mouch) and
[CouchDB](http://couchdb.apache.org/) you can build powerful
[Couchapps](http://couchapp.org/) using plain HTML, CSS and JavaScript.
Mouch will [assemble](#build) the project files and [deploy](#push) the
application.

1. [Installation](#installation)
2. [Usage](#usage)
3. [Docs](#docs)
4. [License](#license)


Mouch is a single [Ruby script](https://raw.github.com/jo/mouch/master/mouch),
which you can check into your repository.
That way everybody can instantly start working on the project without the need
of installing anything.

The `mouch` command compiles your project into one JSON, which can be deployed
to a CouchDB server.

The format of the JSON is the one CouchDB uses for the
[Bulk Document API](http://wiki.apache.org/couchdb/HTTP_Bulk_Document_API):

    {
      "docs": [
        { "_id": "mydoc" },
        { "_id": "otherdoc" }
      ]
    }

A Mouch project typically has one `app.json.erb`
[Ruby ERB](http://ruby-doc.org/stdlib-1.9.3/libdoc/erb/rdoc/ERB.html) template,
which bundles all documents:

    {
      "docs": [
        <%= read 'mydoc/app.json.erb' %>,
        <%= read 'otherdoc/app.json.erb' %>
      ]
    }



<a id=installation></a>


Installation
------------

[The mouch script](https://raw.github.com/jo/mouch/master/mouch)
can live inside your project, copy it to `/usr/local/bin` or where you prefer.
You can install it with `curl`:

    curl https://raw.github.com/jo/mouch/master/mouch > mouch
    chmod +x mouch

or with `git`:

    git clone git://github.com/jo/mouch.git

### Prerequisites

* ruby
* ruby-json
* curl
* imagemagick (optional)

### How to Get a Couch

You can install CouchDB via your package manager
or from [couchdb.apache.org](http://couchdb.apache.org/).
The easyiest way is to setup a free account on
[Cloudant](https://cloudant.com/) or [Iris Couch](http://www.iriscouch.com/).

### Running the Tests

Mouch has a very few tests, which you can run with

    ./mouch --test
    #=>  # Running tests:
    #=>  .....
    #=>  Finished tests in 0.071161s, 70.2636 tests/s, 70.2636 assertions/s.
    #=>  5 tests, 5 assertions, 0 failures, 0 errors, 0 skips



<a id=usage></a>


Usage
-----

    ./mouch [file] [urls] [options]
    --test  run test suite

### Authentication

Mouch allows passing the credentials in the URL:

    http://username:password@localhost:5984/dbname

<a id=build></a>

### Render Template

    ./mouch [file]

When you omit the `file` argument, data is read from `STDIN`.

    ./mouch app.json.erb
    echo '{ "title": <%=h base64 "Welcome" %> }' | ./mouch
    #=> { "title": "V2VsY29tZQ==" }

<a id=push></a>

### Deploy to Server

    ./mouch [file] urls

When Mouch detects urls as arguments, your app will be pushed immediately to
all of these urls.

*Attention*: Mouch overwrites existing data.
Mouch fetches the current revisions of the documents (if any) and pays no
attention to conflicts.

    ./mouch app.json.erb http://localhost:5984/myapp
    #=> * push http://localhost:5984/myapp
    #=> 1 doc pushed

Note that you can push to many urls:

    ./mouch app.json.erb http://localhost:5984/myapp http://example.com/myapp

### `COUCH_URL`

If the environment variable `COUCH_URL` exists, it will be used for pushing:


    COUCH_URL=http://localhost:5984/myapp ./mouch app.json.erb

### Auto Push

You can use `inotify` to listen for filesystem changes and push on every save:

    inotifywait -m -r --exclude "\.swp$" -e modify . | xargs -n 1 -I {} echo "./mouch app.json.erb http://localhost:5984/heimat" | bash



<a id=docs></a>


Docs: Build Functions
---------------------

The ERB context provides you with a few methods for handling file content:

* [`h`](#h) - Escape JSON values
* [`base64`](#base64) - Encode content
* [`read`](#read) - Read files and render .erb templates
* [`map`](#map) - Map directories to JSON objects
* [`attachment`](#attachment) - Generate \_attachment object
* [`attachments`](#attachments) - Generate \_attachments entries
* [`convert`](#convert) - Convert images using ImageMagick


<a id=h></a>

### h(content)

escape `content` string.

#### Example

    h '<script>var title = "This is Mouch";</script>'

will produce

    "<script>var title = \"This is Mouch\";<\/script>"


<a id=base64></a>

### base64(content)

encode `content` strings base64.
Used internally to encode attachments.
This method is also useful to inline images in stylesheets.

#### Example

    base64 'My name is Mouch!'

results in

    TXkgbmFtZSBpcyBNb3VjaCE=


<a id=read></a>

### read(patterns)

Read files from filesystem. `patterns` are passed to
[Ruby `Dir.glob`](http://www.ruby-doc.org/core-1.9.3/Dir.html#method-c-glob).

#### Examples

Read one file:

    read 'README.md'

or read all files matching patterns concats them:

    read '\*.js'

To have more control over the order you can supply arrays:

    read ['lib/*.js', 'app/*.js']

Templates are evaluated with build scope, so you can have nested templates:

read 'app.json.erb'

Read the
[Ruby Dir.glob documentation](http://www.ruby-doc.org/core-1.9.3/Dir.html#method-c-glob).


<a id=map></a>

### map(dirname)

Maps the directory `dirname` into into a JSON object.
Strips extnames from filenames for the key.

#### Example

    map 'views'

will transform the the directory

    views
    └── docs
        ├── map.js
        └── reduce.js

into the JSON object

    {
      "docs": {
        "map": "content of map.js"
        "reduce": "content of reduce.js"
      }
    }


<a id=attachment></a>

### attachment(filename, patterns = filename)

Reads attachments matching `patterns` and returns an
[Inline Attachments Object](http://wiki.apache.org/couchdb/HTTP_Document_API#Inline_Attachments)
as JSON.
(`filename` is used for `content_type` lookup)

#### Example

    attachment "app.js", ["lib/*.js", "app/*.js", "init.js"]

will produce

    {
      "content_type": "application/javascript; charset=utf-8",
      "data": "<base 64 encoded content of all js files from lib, app and init.js concatinated>"
    }


<a id=attachments></a>

### attachments(patterns)

Reads attachments matching `patterns` and returns an
[Inline Attachments Object](http://wiki.apache.org/couchdb/HTTP_Document_API#Inline_Attachments)
as JSON.

#### Example

    attachments ["favicon.ico", "index.html"]

will produce

    {
      "favicon.ico": {
        "content_type": "image/x-icon",
        "data": "<base 64 encoded content of favicon.ico>"
      },
      "index.html": {
        "content_type": "text/html; charset=utf-8",
        "data": "<base 64 encoded content of index.html>"
      }
    }


<a id=convert></a>

### convert(patterns, format = 'png', options = nil)

Convert images using the [ImageMagick](http://www.imagemagick.org/)
`convert` program. The default is to convert the image to `png`.
Specify `format` to any format string ImageMagick understands.
You may want to specify other `options` as string, which
are passed directly to ImageMagick.

For a list of image format types supported by ImageMagick, use

    `convert -list format`

on the command line and visit the
[ImageMagick documentation](http://www.imagemagick.org/).

#### Example

    convert 'icon.svg', 'ico', '-resize 16x16 -transparent white'

will generate an `.ico` image and scale it to 16x16 px.



<a id=license></a>


The MIT License (MIT)
---------------------

Copyright © 2011 Johannes J. Schmidt, [TF](ttp://die-tf.de)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the “Software”), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
