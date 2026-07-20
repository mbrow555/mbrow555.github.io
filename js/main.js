 /* 
   main.js — shared site-wide script (Milestone 3)
   Loaded on every page. Two independent pieces of logic live here:
     1. Mobile nav toggle — runs on every page, shows/hides the
        menu behind a hamburger button on small screens.
     2. Quiz grading logic — only does anything on quiz.html,
        because that's the only page with a #quiz-form element.
   Kept as one file on purpose: the assignment calls for a single
   external JS file for the whole site.
    */

// ---- 1. Mobile nav toggle (runs on every page) ----------------------
var navToggle = document.getElementById("nav-toggle");
var mainNav = document.querySelector(".main-nav");

if (navToggle && mainNav) {
  navToggle.addEventListener("click", function () {
    // .open is the hook the CSS media query uses to show the
    // menu as a dropdown on narrow screens (see style.css).
    var isOpen = mainNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  // Close the menu automatically once a link is tapped, so it
  // doesn't stay open after navigating on mobile.
  var navLinks = mainNav.querySelectorAll("a");
  for (var n = 0; n < navLinks.length; n++) {
    navLinks[n].addEventListener("click", function () {
      mainNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  }
}

// ---- 2. Quiz logic (only runs on quiz.html) --------------------------

// 2a. The answer key
// One entry per question. Each entry stores:
//   type    - "text", "radio", or "checkbox" (multi-select)
//   name    - matches the form field's "name" attribute
//   answer  - the correct value (a single string for text/radio,
//             an array of strings for checkbox)
//   prompt  - short label used when showing results
var questions = [
  {
    type: "text",
    name: "q1",
    answer: "telescoping",
    prompt: "Q1 (fill in the blank): correct answer is \"telescoping\""
  },
  {
    type: "radio",
    name: "q2",
    answer: "guard",
    prompt: "Q2: correct answer is \"Guard (entry) node\""
  },
  {
    type: "radio",
    name: "q3",
    answer: "strip",
    prompt: "Q3: correct answer is \"Strips the final encryption layer and forwards data to the destination\""
  },
  {
    type: "radio",
    name: "q4",
    answer: "curve25519",
    prompt: "Q4: correct answer is \"Curve25519\""
  },
  {
    type: "checkbox",
    name: "q5",
    answer: ["a", "b", "d"],
    prompt: "Q5: correct answers are \"reachable only through Tor\", \"uses introduction/rendezvous points\", and \"gives mutual anonymity\""
  }
];

// 2b. Grab the elements we need once, up front.
// On any page other than quiz.html these are simply null — that's
// fine, nothing below runs unless quizForm actually exists (see the
// guard at the bottom of this file).
var quizForm = document.getElementById("quiz-form");
var resultsBox = document.getElementById("quiz-results");
var resetBtn = document.getElementById("reset-btn");

//  2c. Helper: read the user's answer for one question
function getUserAnswer(question) {
  if (question.type === "text") {
    var input = document.getElementById(question.name);
    return input.value.trim().toLowerCase();
  }

  if (question.type === "radio") {
    var radios = document.getElementsByName(question.name);
    for (var i = 0; i < radios.length; i++) {
      if (radios[i].checked) {
        return radios[i].value;
      }
    }
    return null; // nothing selected
  }

  if (question.type === "checkbox") {
    var boxes = document.getElementsByName(question.name);
    var selected = [];
    for (var j = 0; j < boxes.length; j++) {
      if (boxes[j].checked) {
        selected.push(boxes[j].value);
      }
    }
    return selected;
  }
}

//  2d. Helper: compare a user's answer to the correct answer
function isCorrect(question, userAnswer) {
  if (question.type === "text") {
    return userAnswer === question.answer;
  }

  if (question.type === "radio") {
    return userAnswer === question.answer;
  }

  if (question.type === "checkbox") {
    var correct = question.answer;

    // Must have the same number of selections...
    if (userAnswer.length !== correct.length) {
      return false;
    }
    // ...and every selected value must be in the correct list.
    for (var i = 0; i < userAnswer.length; i++) {
      if (correct.indexOf(userAnswer[i]) === -1) {
        return false;
      }
    }
    return true;
  }
}

//  2e. Grade the whole quiz and display results
function gradeQuiz(event) {
  event.preventDefault(); // stop the page from reloading on submit

  var correctCount = 0;
  var resultItemsHtml = "";

  for (var i = 0; i < questions.length; i++) {
    var question = questions[i];
    var userAnswer = getUserAnswer(question);
    var correct = isCorrect(question, userAnswer);

    if (correct) {
      correctCount = correctCount + 1;
    }

    var statusClass = correct ? "correct" : "incorrect";
    var statusLabel = correct ? "Correct" : "Incorrect";

    resultItemsHtml +=
      '<div class="result-item ' + statusClass + '">' +
        '<span class="status">' + statusLabel + '</span>' +
        '<p>' + question.prompt + '</p>' +
      '</div>';
  }

  var total = questions.length;
  var passed = correctCount >= Math.ceil(total * 0.6); // 60% to pass
  var bannerClass = passed ? "pass" : "fail";
  var bannerText = passed
    ? "Pass — nice work!"
    : "Not a pass yet — review the material and try again.";

  var summaryHtml =
    '<div class="result-banner ' + bannerClass + '">' +
      bannerText +
      '<br>Score: ' + correctCount + ' / ' + total +
    '</div>';

  resultsBox.innerHTML = summaryHtml + resultItemsHtml;
}

//  2f. Reset the quiz: clear inputs and clear results
function resetQuiz() {
  quizForm.reset();          // clears all text/radio/checkbox inputs
  resultsBox.innerHTML = ""; // clears the results display
}

//  2g. Wire up the event listeners — guarded so this only runs on
//      quiz.html, where these elements actually exist.
if (quizForm && resetBtn) {
  quizForm.addEventListener("submit", gradeQuiz);
  resetBtn.addEventListener("click", resetQuiz);
}
