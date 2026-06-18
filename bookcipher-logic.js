/* ============================================================
   Book Cipher — pure, DOM-free extraction logic.
   Shared by index.html (the tool) and test.html (the runner).

   A book cipher extracts a smaller text out of a larger text by
   index. An index "tuple" walks from the largest unit to the
   smallest (paragraph -> line -> word -> letter). This file is a
   lift-and-shift of the original inline logic: behavior, quirks
   and output markers (" Err:", "### ") are preserved exactly.

   Options object threaded through the counters:
     { splitHyphenated, countSpaces, countSpecial }
   ============================================================ */

(function () {
   "use strict";

   // Module-level "find" offset. Mirrors the original global
   // g_nFindDelta: it is subtracted from the first index piece so
   // OnFind can sweep the whole text by an offset.
   var g_nFindDelta = 0;

   if (!String.prototype.count) {
      String.prototype.count = function (s1) {
         return (this.length - this.replaceAll(s1, "").length) / s1.length;
      };
   }

   function getParagraph(txt, n) {
      return txt.split("\n\n")[n - 1];
   }

   function getLine(txt, n) {
      txt = txt.replaceAll("\n\n", "\n");
      txt = txt.replaceAll("\n\n", "\n");
      txt = txt.replaceAll("\n\n", "\n");
      return txt.split("\n")[n - 1];
   }

   function getWord(txt, n, opts) {
      opts = opts || {};
      txt = txt.replaceAll("\n", " ");
      txt = txt.replace(/[^a-z0-9- ]/gi, "");
      if (opts.splitHyphenated) {
         txt = txt.replaceAll("-", " ");
      }
      txt = txt.replaceAll(" - ", " ");
      txt = txt.replaceAll("  ", " ");
      txt = txt.replaceAll("  ", " ");
      txt = txt.replaceAll("  ", " ");
      return txt.trim().split(" ")[n - 1];
   }

   function getLetter(txt, n, opts) {
      opts = opts || {};
      txt = txt.replaceAll("\n", "");
      if (!opts.countSpaces) {
         txt = txt.replaceAll(" ", "");
      }
      if (!opts.countSpecial) {
         txt = txt.replace(/[^a-z0-9 ]/gi, ""); // Remove all but alphanumeric and spaces
      }
      if (n > txt.length) {
         return undefined;
      } else {
         return txt.split("")[n - 1];
      }
   }

   function FindSeperator(str) {
      if (str.indexOf(":") > 0) return ":";
      else if (str.indexOf(",") > 0) return ",";
      else if (str.indexOf(".") > 0) return ".";
      else if (str.indexOf("-") > 0) return "-";
      else return "";
   }

   function GetPiece(key, n, seperator) {
      var x = key.split(seperator)[n - 1];
      if (n == 1) {
         x -= g_nFindDelta;
      }
      return x;
   }

   function CreateTuple(tuple) {
      var output = "";
      for (var i = 0; i < tuple.length; i++) {
         if (i != 0) {
            output += ":";
         }
         output += tuple[i].toString();
      }
      return output;
   }

   function GetCipherText(inputText, sTuple, extractionType, seperator, opts) {
      var outputText;
      var cipWord, cipLine, cipParagraph;
      try {
         switch (parseInt(extractionType)) {
            case 1:
               outputText = getLetter(inputText, parseInt(sTuple) - g_nFindDelta, opts);
               break;
            case 2:
               outputText = getWord(inputText, parseInt(sTuple) - g_nFindDelta, opts);
               if (outputText != undefined) { outputText += " "; }
               break;
            case 4:
               cipWord = getWord(inputText, parseInt(sTuple) - -g_nFindDelta, opts);
               outputText = getLetter(cipWord, 1, opts);
               break;
            case 21:
               cipWord = getWord(inputText, GetPiece(sTuple, 1, seperator), opts);
               outputText = getLetter(cipWord, GetPiece(sTuple, 2, seperator), opts);
               break;
            case 31:
               cipLine = getLine(inputText, GetPiece(sTuple, 1, seperator));
               outputText = getLetter(cipLine, GetPiece(sTuple, 2, seperator), opts);
               break;
            case 32:
               cipLine = getLine(inputText, GetPiece(sTuple, 1, seperator));
               outputText = getWord(cipLine, GetPiece(sTuple, 2, seperator), opts);
               if (outputText != undefined) { outputText += " "; }
               break;
            case 41:
               cipParagraph = getParagraph(inputText, GetPiece(sTuple, 1, seperator));
               outputText = getLetter(cipParagraph, GetPiece(sTuple, 2, seperator), opts);
               break;
            case 42:
               cipParagraph = getParagraph(inputText, GetPiece(sTuple, 1, seperator));
               outputText = getWord(cipParagraph, GetPiece(sTuple, 2, seperator), opts);
               if (outputText != undefined) { outputText += " "; }
               break;
            case 321:
               cipLine = getLine(inputText, GetPiece(sTuple, 1, seperator));
               cipWord = getWord(cipLine, GetPiece(sTuple, 2, seperator), opts);
               outputText = getLetter(cipWord, GetPiece(sTuple, 3, seperator), opts);
               break;
            case 421:
               cipParagraph = getParagraph(inputText, GetPiece(sTuple, 1, seperator));
               cipWord = getWord(cipParagraph, GetPiece(sTuple, 2, seperator), opts);
               outputText = getLetter(cipWord, GetPiece(sTuple, 3, seperator), opts);
               break;
            case 431:
               cipParagraph = getParagraph(inputText, GetPiece(sTuple, 1, seperator));
               cipLine = getLine(cipParagraph, GetPiece(sTuple, 2, seperator));
               outputText = getLetter(cipLine, GetPiece(sTuple, 3, seperator), opts);
               break;
            case 432:
               cipParagraph = getParagraph(inputText, GetPiece(sTuple, 1, seperator));
               cipLine = getLine(cipParagraph, GetPiece(sTuple, 2, seperator));
               outputText = getWord(cipLine, GetPiece(sTuple, 3, seperator), opts);
               if (outputText != undefined) { outputText += " "; }
               break;
            case 4321:
               cipParagraph = getParagraph(inputText, GetPiece(sTuple, 1, seperator));
               cipLine = getLine(cipParagraph, GetPiece(sTuple, 2, seperator));
               cipWord = getWord(cipLine, GetPiece(sTuple, 3, seperator), opts);
               outputText = getLetter(cipWord, GetPiece(sTuple, 4, seperator), opts);
               break;
         }
      } catch (err) {
         outputText = undefined;
      }
      return outputText;
   }

   /* ---------------------------------------------------------
      runAction — decode: given the cipher KEYS, pull the hidden
      text out of inputText. Mirrors the original RunAction().
      findDelta sweeps the offset (OnFind); pass 0 for Action.
      --------------------------------------------------------- */
   function runAction(inputText, extractionTypes, bookCipherKeys, opts, findDelta) {
      g_nFindDelta = findDelta || 0;
      opts = opts || {};

      var outputText = "";
      var i, n;
      var lines;
      var offsetcount = 0;
      var keypieces, extractionType, sTuple, sOutput, seperator, bookCipherKey;

      lines = bookCipherKeys.split("\n");
      for (n = 0; n < lines.length; n++) {
         if (lines[n].length > 0) {
            bookCipherKey = lines[n].trim().split(" ");
            seperator = FindSeperator(bookCipherKey[0]);

            if (extractionTypes == 0) { // Auto detect
               if (seperator == "") {
                  keypieces = bookCipherKey[0].length;
               } else {
                  keypieces = bookCipherKey[0].count(seperator) + 1;
               }
               switch (keypieces) {
                  case 1: extractionType = "1"; break;
                  case 2: extractionType = "31"; break;
                  case 3: extractionType = "321"; break;
                  case 4: extractionType = "4321"; break;
               }
            } else {
               extractionType = extractionTypes;
            }

            for (i = 0; i < bookCipherKey.length; i++) {
               if (bookCipherKey[i] != "") {
                  sTuple = bookCipherKey[i].trim();
                  switch (parseInt(extractionType)) {
                     case 3:
                        offsetcount += parseInt(sTuple);
                        sOutput = GetCipherText(inputText, offsetcount, 1, seperator, opts);
                        break;
                     case 5:
                        sOutput = GetCipherText(inputText, (offsetcount + 1).toString() + ":" + sTuple, 31, ":", opts);
                        offsetcount += 1;
                        break;
                     case 6:
                        offsetcount += parseInt(sTuple);
                        sOutput = GetCipherText(inputText, offsetcount, 2, seperator, opts);
                        break;
                     case 7:
                        offsetcount += parseInt(sTuple);
                        sOutput = GetCipherText(inputText, offsetcount, 4, seperator, opts);
                        break;
                     default:
                        sOutput = GetCipherText(inputText, sTuple, extractionType, seperator, opts);
                        break;
                  }

                  if (sOutput == undefined) {
                     outputText += " Err: " + bookCipherKey[i];
                  } else {
                     outputText += sOutput;
                  }
               }
            }
         }
         outputText += "\n";
      }
      return outputText;
   }

   /* ---------------------------------------------------------
      createKeys — encode: given a target text (bookCipherText)
      and a source text (inputText), search for index tuples that
      reproduce the target one character/word at a time. Mirrors
      the original OnCreate(). "### " marks an unresolvable spot,
      after a single restart attempt.
      --------------------------------------------------------- */
   function createKeys(inputText, bookCipherText, extractionTypes, opts) {
      g_nFindDelta = 0;
      opts = opts || {};

      if (extractionTypes == 0) { extractionTypes = "321"; } else { extractionTypes = extractionTypes.toString(); }

      var extractionlength = extractionTypes.toString().length;
      var akeys = Array.apply(null, Array(extractionlength)).map(function () { return 1; });
      var nPart = extractionlength - 1;
      var outputText = "";
      var nLetter = 0;
      var sTuple, sValue, sToFind;
      var hasreset = false;
      var offsetcount = 0;

      while (nLetter < bookCipherText.length) {
         if (extractionTypes[extractionTypes.length - 1] == 2) {
            sToFind = getWord(bookCipherText, nLetter + 1, opts);
            if (sToFind == undefined) break;
         } else {
            sToFind = bookCipherText.charAt(nLetter);
         }

         if (sToFind.match(/^[0-9a-zA-Z]+$/)) {
            sTuple = CreateTuple(akeys);

            switch (parseInt(extractionTypes)) {
               case 3:
                  sValue = GetCipherText(inputText, offsetcount + parseInt(sTuple), 1, ":", opts);
                  break;
               case 6:
                  sValue = GetCipherText(inputText, offsetcount + parseInt(sTuple), 2, ":", opts);
                  break;
               case 7:
                  sValue = GetCipherText(inputText, offsetcount + parseInt(sTuple), 4, ":", opts);
                  break;
               default:
                  sValue = GetCipherText(inputText, sTuple, extractionTypes, ":", opts);
                  break;
            }

            if (sValue == undefined) {
               while (akeys[nPart] == 1 && nPart > 0) {
                  nPart -= 1;
               }
               if (nPart == 0) {
                  if (hasreset) {
                     hasreset = false;
                     outputText += "### ";
                     nLetter += 1;
                  } else {
                     // Restart
                     akeys = Array.apply(null, Array(extractionlength)).map(function () { return 1; });
                     hasreset = true;
                  }
               } else {
                  // Increase previous index
                  nPart -= 1;
                  akeys[nPart] = akeys[nPart] + 1;
                  for (var i = nPart + 1; i < extractionlength; i++) { akeys[i] = 1; }
               }
               nPart = extractionlength - 1;
            } else {
               if (sValue.toLowerCase().trim() == sToFind.toLowerCase()) { // Found it
                  hasreset = false;
                  outputText += sTuple + " ";
                  offsetcount += parseInt(sTuple);
                  if (extractionTypes == 3 || extractionTypes == 6 || extractionTypes == 7) {
                     akeys = Array.apply(null, Array(extractionlength)).map(function () { return 1; });
                  }
                  nLetter += 1;
               } else {
                  // Increase previous index
                  akeys[nPart] = akeys[nPart] + 1;
               }
            }
         } else {
            nLetter += 1;
            outputText += sToFind;
         }
      }

      return outputText;
   }

   var api = {
      runAction: runAction,
      createKeys: createKeys,
      getWord: getWord,
      getLetter: getLetter,
      getLine: getLine,
      getParagraph: getParagraph,
      getCipherText: GetCipherText,
      findSeperator: FindSeperator
   };

   if (typeof module !== "undefined" && module.exports) module.exports = api;
   if (typeof globalThis !== "undefined") Object.assign(globalThis, api);
})();
