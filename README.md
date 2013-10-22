Logiform
========

Logiform creates a MongoDB-alike query string from a sequence of complex conditions, vice versa.


Demo site
---------

<http://lqez.github.io/logiform/>


Download
--------

There is no bower configuration, yet. Please clone me from here.


How to use
----------

Download logiform and add below codes into the <head> section of your HTML page.

    <script src="logiform.js"></script> 
    <link rel="stylesheet" href="logiform.css">

And activate it!

    $("#foobar").logiform();


Customizing options
-------------------

Customizing logiform via plugin settings, like below.

    $("#foobar").logiform({
        'liveUpdate': true,
        'prettify': false,

        'width': {
            'logicalOperator': "100px",
            'comparisonOperator': "200px"
        },

        'onUpdate': function () {
            // Blahblah
        }
    });


 - `target`
    - Set an target element of logiform. If you leave this null, logiform will be displayed beside the element.
    - default : `null` 

 - `prettify`
    - Bake JSON string with indent and linefeed.
    - default : `false`

 - `liveUpdate`
    - Update JSON string everytime when you changed.
    - default : `false`

 - `hideOriginal`
    - Hide source element. (textarea, input...)
    - default : `true`

 - `onUpdate` 
    - Logifom will call this callback function after updating conditions.
    - default : `null`

 - `width`
    - Set width of each item.
    - `width.logicalOperator` : `80px`
    - `width.field` : `200px`
    - `width.comparisonOperator` : `100px`
    - `width.value` : `200px`

 - `text`
    - Set title of each item.
    - `add-condition` : `+ Condition`
    - `add-condition-group` : `+ Group`,
    - `remove-condition` : `-`,
    - `remove-condition-group` : `Remove`

 - You can also customize operators.
    - Please refer [default settings](https://github.com/lqez/logiform/blob/master/logiform.js#L4)



License
-------
Logiform is distributed under MIT License. See LICENSE file.
