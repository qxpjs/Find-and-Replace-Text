/*
File: Find and Replace Text.js
Description: The following script finds and replaces All INSTANCES of a user entered string to a target user entered string with attributes
*/

//import basic checks
if (typeof (isLayoutOpen) == "undefined") {
	//import basic checks
	app.importScript(app.getAppScriptsFolder() + "/Dependencies/qx_validations.js");
	console.log("Loaded library for basic validation checks from application.");
}

if (isLayoutOpen()) {
	//Get all Text Boxes from the Layout
	let stories = app.activeLayoutDOM().querySelectorAll('qx-story');//each text box has a story
	if (null == stories[0]) {
		//No Text Box
		alert("There are no text boxes on the layout to run the script!");
	}
	else {
		//Take User Input
		let str = prompt("Replace what?\n (Note: Strings are Case Sensitive)");
		let str2;
		if (str != null) {

			str2 = prompt("Replace with:\n (Note: Strings are Case Sensitive)");
			if (str2 != null) {
				let strLen = str.length;
				str = replaceSlashes(str);
				str2 = replaceSlashes(str2);
				let cumuLen = 0;
				let input, output, portion1, portion2;
				let SpansToDelete = new Array();
				let replacements = 0;
				let SpanNum, EndSpanNum, postSpanCount, remLen;

				//Iterate through all Text boxes
				for (let i = 0; i < stories.length; i++) {
					//Iterate through all the text paragraphs from the box
					let boxParagraphs = stories[i].getElementsByTagName("qx-p");
					for (let p = 0; p < boxParagraphs.length; p++) {
						let paragraph = boxParagraphs[p].innerText;//gets the text content of the paragraph
						//Get all the text runs from the paragraph
						let boxTextSpans;
						boxTextSpans = boxParagraphs[p].getElementsByTagName("qx-span");

						//search for the first occurrence of the required string
						let index = paragraph.search(str);// finds the index of first occurrence of string
						let cumulativeLength = 0;
						let spanLengths = [];
						//Iterate through all instances in the paragraph
						while (index >= 0) {
							replacements++;
							//Iterate through all text runs in the paragraph
							for (let j = 0; j < boxTextSpans.length; j++) {
								spanLengths[j] = boxTextSpans[j].textContent.length;
							}
							//get the span with the first letter of required string
							for (let k = 0; k < boxTextSpans.length; k++) {
								cumulativeLength += spanLengths[k];
								if (cumulativeLength > index) {
									SpanNum = k;
									break;
								}
							}

							input = boxTextSpans[SpanNum].textContent;
							if (input == "") {
								SpanNum += 1;
								input = boxTextSpans[SpanNum].textContent;
							}
							cumuLen = cumulativeLength;
							//find the in between spans
							cumulativeLength = 0;
							for (let s = 0; s < boxTextSpans.length; s++) {
								cumulativeLength += spanLengths[s];
								if (cumulativeLength > (index + strLen - 1)) {
									EndSpanNum = s;
									break;
								}
							}
							postSpanCount = EndSpanNum - SpanNum;


							//delete remaining string
							if (postSpanCount == 0)//The whole string is in a single span
							{
								portion1 = str;//simply replace the source string to destination 
								boxTextSpans[SpanNum].textContent = replaceFirst(portion1, input, str2);
							}

							else if (postSpanCount == 1)//The whole string exists in two spans
							{
								portion1 = paragraph.substring(index, cumuLen);// replace the portion lying in the first span to destination
								boxTextSpans[SpanNum].textContent = replaceFirst(portion1, input, str2);
								remLen = strLen - portion1.length;
								portion2 = paragraph.substr(cumuLen, remLen);// replace the portion lying in the last span to null
								boxTextSpans[SpanNum + 1].textContent = replaceLast(portion2, boxTextSpans[SpanNum + 1].textContent, SpanNum + 1);

							}
							else// The string consists of more spans
							{
								portion1 = paragraph.substring(index, cumuLen);// replace the portion lying in the first span to destination
								boxTextSpans[SpanNum].textContent = replaceFirst(portion1, input, str2);
								remLen = strLen - portion1.length;
								for (let j = SpanNum + 1; j < SpanNum + postSpanCount; j++)//delete in between spans
								{
									deleteSpan(j);
									remLen = remLen - boxTextSpans[j].textContent.length;
									cumuLen += boxTextSpans[j].textContent.length;
								}
								portion2 = paragraph.substr(cumuLen, remLen);// replace the portion lying in the last span to null
								boxTextSpans[j].textContent = replaceLast(portion2, boxTextSpans[j].textContent, j);
							}
							//find the next occurrence
							paragraph = boxParagraphs[p].innerText;
							index = paragraph.search(str);
							cumulativeLength = 0;
						}
					}
				}
				alert(replacements + " replacements made");
				deleteExtraSpans(SpansToDelete);
			}
		}
	}

}
//*****************====================================Functions used in the JavaScript===============================****************//
//function to add escape character to slashes
function replaceSlashes(str) {
	str = str.replace(/\//g, "\/");
	str = str.replace(/\\/g, "\\\\");
	return str;
}

//function to replace text in the first span 
function replaceFirst(portion, input, str2) {
	return input.replace(portion, str2);
}
//function to replace text in the last span to blank
function replaceLast(portion, input, spanIndex) {
	output = input.replace(portion, "");
	if (output.length == 0) {
		deleteSpan(spanIndex);
		return input;
	}
	else
		return output;
}

//deletes a span
function deleteSpan(index) {
	SpansToDelete.push(boxTextSpans[index]);
}

//delete all span nodes in a given array
function deleteExtraSpans(SpansToDelete) {
	let k = 0;
	while (SpansToDelete[k] != null)// to traverse through all the boxes
	{
		SpansToDelete[k].remove();
		k++;
	}
}


