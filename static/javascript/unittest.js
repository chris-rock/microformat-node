/* 
 Code is licensed under MIT License © Copyright Glenn Jones 2012. All Rights Reserved.
 -----------------------------------------------------------------------------*/

var results = new Array();

$(document).ready(function() {

  var testSuites = [
    'http://www.ufxtract.com/testsuite/hcard/default.htm',
    'http://www.ufxtract.com/testsuite/hcalendar/default.htm',
    'http://www.ufxtract.com/testsuite/hresume/default.htm',
    //'http://www.ufxtract.com/testsuite/hrecipe/default.htm',
    'http://www.ufxtract.com/testsuite/geo/default.htm'
  ]

  var testFixtures = [
    'http://microformats.org/wiki/value-dt-test-YYYY-MM-DD--HH-MM',
    'http://microformats.org/wiki/value-dt-test-abbr-YYYY-MM-DD--HH-MM',
    'http://microformats.org/wiki/value-dt-test-abbr-YYYY-MM-DD-abbr-HH-MM',
    'http://microformats.org/wiki/value-dt-test-YYYY-MM-DD--HHpm',
    'http://microformats.org/wiki/value-dt-test-YYYY-MM-DD--Hpm-EEpm',
    'http://microformats.org/wiki/value-dt-test-YYYY-MM-DD--abbr-HH-MMpm',
    'http://microformats.org/wiki/value-dt-test-YYYY-MM-DD--12am-12pm',
    'http://microformats.org/wiki/value-dt-test-YYYY-MM-DD--H-MMam-Epm',
    'http://microformats.org/wiki/value-dt-test-YYYY-MM-DD--0Ham-EEam',
    'http://microformats.org/wiki/value-dt-test-YYYY-MM-DD--H-MM-SSpm-EE-NN-UUpm',
    'http://microformats.org/wiki/value-dt-test-YYYY-DDD--HH-MM-SS',
    'http://microformats.org/wiki/value-dt-test-YYYY-MM-DD--HH-MMZ-EE-NN-UUZ',
    'http://microformats.org/wiki/value-dt-test-YYYY-MM-DD--HH-MM-XX-YY--EE-NN-UU--XXYY',
    'http://microformats.org/wiki/value-dt-test-YYYY-MM-DD--HH-MM-XX--EE-NN-UU--Y',
    'http://microformats.org/wiki/value-dt-test-YYYY-MM-DD--HH-MM-SS-XXYY--EE-NN--Z'
  ]

  for (var y = 0; y < testSuites.length; y++) {
    $.getJSON('../?url=' + encodeURIComponent(testSuites[y]) + '&format=test-suite', function(err, data) {
      if(data.microformats['test-suite']){

        var testSuite = data.microformats['test-suite'];
        for (var key in testSuite) {
          if (!testSuite.hasOwnProperty(key))
            continue;  // skip this 
                            
          var item = testSuite[key];
          var i = item.test.length;
          var x = 0;
          while (x < i) {
              $('<li data-url="'+ item.test[x].url +'">' + item.test[x].format + ' - ' + item.test[x].description +'</li>').appendTo('#tests').click(function(e){
                  $('#tests li').removeClass('hilight');
                  $(this).addClass('hilight');
                  loadTestFixture($(this).attr('data-url'))
              })
              x++;
          }
        }
      }
    });
  }

  //// the wiki test suite needs some more work before it can be tested against
  // for (var z = 0; z < testFixtures.length; z++) {
  //   $('<li data-url="'+ testFixtures[z] +'">' + testFixtures[z].replace('http://microformats.org/wiki/','')  +'</li>').appendTo('#tests').click(function(e){
  //     $('#tests li').removeClass('hilight');
  //     $(this).addClass('hilight');
  //     loadTestFixture($(this).attr('data-url'))
  //   })
  // }

});


function loadTestFixture(url){
  $.getJSON('../?url=' + encodeURIComponent(url) + '&callback=?', function(err, data) {
    loadTestData(url, data);
  });
}


function loadTestData(url,data){
  $.getJSON('../?url=' + encodeURIComponent(url + '#uf') + '&callback=?', function(err, ufData) {
    var testFixture = data.microformats['test-fixture'];

    if(testFixture.length > 0){
      if(data.microformats['test-fixture'][0].assert){
        var asserts = data.microformats['test-fixture'][0].assert;
        var table = addResultTable(data.microformats['test-fixture'][0].summary, url, ufData.microformats );
        runTests(asserts, ufData.microformats, table);
      }
    }else{
      alert('No test found')
    }
    
  });
}


function runTests(asserts, microformats, table){

  for (var i = 0; i < asserts.length; i++) {

    var test = asserts[i].test;
    var result = asserts[i].result;
    var comment = asserts[i].comment;
    var testStatus = "none";
    pageNumber = 1
    resuult = {};

    if (result.indexOf("IsEqualTo(") > -1) {
        result = new Result(pageNumber, i, asserts[i], isEqualTo(test, result, comment, microformats));
    }
    else if (result.indexOf("IsEqualToCaseInsensitive(") > -1) {
        result = new Result(pageNumber, i, asserts[i], isEqualToCaseInsensitive(test, result, comment, microformats));
    }
    else if (result.indexOf("IsEqualToISODate(") > -1) {
        result = new Result(pageNumber, i, asserts[i], isEqualToISODate(test, result, comment, microformats));
    }
    else if (result.indexOf("IsEqualToGeo(") > -1) {
        result = new Result(pageNumber, i, asserts[i], isEqualToGeo(test, result, comment, microformats));
    }
    else if (result.indexOf("IsEqualToPhoneNumber(") > -1) {
        result = new Result(pageNumber, i, asserts[i], isEqualToPhoneNumber(test, result, comment, microformats));
    }
    else if (result.indexOf("IsTrue()") > -1) {
        result = new Result(pageNumber, i, asserts[i], isTrue(test, result, comment, microformats));
    }
    else if (result.indexOf("IsFalse()") > -1) {
        result = new Result(pageNumber, i, asserts[i], isFalse(test, result, comment, microformats));
    }
    else if (result.indexOf("HasProperty(") > -1) {
        result = new Result(pageNumber, i, asserts[i], HasProperty(test, result, comment, microformats));
    }
    else {
        result = new Result(pageNumber, i, asserts[i], 'unnone');
    }

    results.push(result);
    addResult(result, table);
    updateCounts(result);
  }
}


function addResultTable(title, url, microformats){
  $('#results').empty();
    $('#results').append('<h2>' + title + '</h2>');
    $('#results').append('<p><a href="' + url +'">Test page address: ' + url + '</a></p>');
    var table = $('<table></table>').appendTo('#results');
    $('#results').append('<pre><code>' + js_beautify(JSON.stringify(microformats)) + '</code></pre>');
    return table;
}


var testCount = 0;
var testFailed = 0;

function updateCounts(result){
  testCount ++;
  if(result.testStatus === 'failed')
    testFailed ++;

  var percent =  trimNumberTo2Places( 100 -(testFailed/testCount * 100) );
  $('#totals').html('<h1><strong>Total test passed: ' 
    + (testCount - testFailed) + ' out ' 
    + testCount  + ' - (' + 
    percent + '%)</strong></h1>')
}


function trimNumberTo2Places(num){
   return Number(num.toString().match(/^\d+(?:\.\d{0,2})?/))
}


function addResult(result, table){
    $(table).append('<tr title="' + result.assert.comment + '"><td class="' + result.testStatus + '">' + result.testStatus + '</td><td>' + result.assert.test + '</td><td>' + result.assert.result + '</td></tr>')
}


// The "isEqualTo" tester
isEqualTo = function (test, result, comment, microformats) {
    resultValue = result.substring(11, result.length - 2)
    testValue = String(getNodeVaue(test, microformats));
    if (testValue != '' && resultValue == testValue)
        return "passed";
    else
        return "failed";
}


// The "isEqualToCaseInsensitive" tester
isEqualToCaseInsensitive = function (test, result, comment, microformats) {
    resultValue = result.substring(26, result.length - 2)
    testValue = String(getNodeVaue(test, microformats));
    if (testValue != '' && resultValue.toLowerCase() == testValue.toLowerCase())
        return "passed";
    else
        return "failed";
}


// The "isEqualToISODate" tester
isEqualToISODate = function (test, result, comment, microformats) {
    output = "failed"
    resultValue = String(result.substring(18, result.length - 2));
    testValue = String(getNodeVaue(test, microformats));
    if (testValue != '' && resultValue.toLowerCase() == testValue.toLowerCase()) {
        output = "passed";
    } else {
        if (CompareISODates(testValue, resultValue))
            output = "passed";
    }
    return output;
}


// The "isEqualToGeo" tester
isEqualToGeo = function (test, result, comment, microformats) {
    output = "failed"
    resultValue = String(result.substring(14, result.length - 2));
    testValue = String(getNodeVaue(test, microformats));
    if (testValue != '' && resultValue.toLowerCase() == testValue.toLowerCase()) {
        output = "passed";
    } else {
        if (CompareRFC2426Geo(testValue, resultValue))
            output = "passed";
    }
    return output;
}


// The "isEqualToPhoneNumber" tester
isEqualToPhoneNumber = function (test, result, comment, microformats) {
    output = "failed"
    resultValue = result.substring(22, result.length - 2)
    testValue = String(getNodeVaue(test, microformats));

    if (testValue != '' && resultValue.toLowerCase() == testValue.toLowerCase()) {
        output = "passed";
    } else {
        if (ComparePhoneNumbers(testValue, resultValue))
            output = "passed";
    }
    return output;
}


// The "isTrue" tester
isTrue = function (test, result, comment, microformats) {
    testValue = getNodeVaue(test, microformats);
    if (typeof (testValue) != 'undefined' && String(testValue.toLowerCase()) == 'true')
        return "passed";
    else
        return "failed";
}


// The "isFalse" tester
isFalse = function (test, result, comment, microformats) {
    testValue = getNodeVaue(test, microformats);
    if (typeof (testValue) != 'undefined' && String(testValue.toLowerCase()) == 'false')
        return "passed";
    else
        return "failed";
}


// The "HasProperty" tester
HasProperty = function (test, result, comment, microformats) {

    var testValue = getNodeVaue(test, microformats);
    var resultValue = result.substring(12, result.length - 1).toLowerCase();
    var output = "failed";


    var nodeHasProperty = true;
    if (testValue == 'undefined' || testValue == null)
        nodeHasProperty = false;

    if (nodeHasProperty == true && resultValue == "true")
        output = "passed";

    if (nodeHasProperty == false && resultValue == 'false')
        output = "passed";

    return output;
}


// A helper function to finds a value of a given JSON property
getNodeVaue = function (test, microformats) {
    // Gets a value from a JSON object
    // vcard[0].url[0]
    var output = null;
    try {
        var arrayDots = test.split(".");
        for (var i = 0; i < arrayDots.length; i++) {
            if (arrayDots[i].indexOf('[') > -1) {
                // Reconstructs and adds access to array of objects
                var arrayAB = arrayDots[i].split("[");
                var arrayName = arrayAB[0];
                var arrayPosition = Number(arrayAB[1].substring(0, arrayAB[1].length - 1));

                if (microformats[arrayName] != null || microformats[arrayName] != 'undefined') {
                    if (microformats[arrayName][arrayPosition] != null || microformats[arrayName][arrayPosition] != 'undefined')
                        microformats = microformats[arrayName][arrayPosition];

                }
                else {
                    currentObject = null;
                }

            }
            else {
                // Adds access to a property using property array ["given-name"]
                if (microformats[arrayDots[i]] != null || microformats[arrayDots[i]] != 'undefined')
                    microformats = microformats[arrayDots[i]];
            }
        }
        output = microformats;
    } catch (err) {
        // Add error capture
        output = null;
    }
    return output;
}


// Simple result storage object used by ParserInterface
function Result(pageNumber, assertNumber, assert, testStatus) {
    this.pageNumber = pageNumber;
    this.assertNumber = assertNumber;
    this.assert = assert; // object with properties
    this.testStatus = testStatus;
}


// Is an object a array
function isArray(obj) {
    return obj && !(obj.propertyIsEnumerable('length')) 
        && typeof obj === 'object' 
        && typeof obj.length === 'number';
};







