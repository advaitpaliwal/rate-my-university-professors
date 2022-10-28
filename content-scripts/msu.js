let profDict = new Map();
function getFirstAndLastName(fullName) {
  return [fullName.split(" ")[0], fullName.split(" ")[1]];
}

async function fetchProfData(fullName) {
  const proxyUrl = "https://stark-garden-64038.herokuapp.com/";
  const url =
    proxyUrl +
    `https://www.ratemyprofessors.com/filter/professor/?page=1&filter=teacherlastname_sort_s+asc&query=${
      getFirstAndLastName(fullName)[1]
    }&queryoption=TEACHER&queryBy=schoolId&sid=601`;
  const res = await fetch(url);
  const data = await res.json();
  const rightProfessor = await getRightProfessor(data, fullName);
  return rightProfessor;
}

async function getRightProfessor(data, fullName) {
  const firstName = getFirstAndLastName(fullName)[0];
  const lastName = getFirstAndLastName(fullName)[1];
  for (let i = 0; i < data.professors.length; i++) {
    if (
      data.professors[i]["tLname"].toLowerCase() == lastName.toLowerCase() &&
      data.professors[i]["tFname"].slice(0, firstName.length).toLowerCase() ==
        firstName.toLowerCase()
    ) {
      return data.professors[i];
    }
  }
}

async function updateElement(element, data, fullName) {
  let num_ratings = "0",
    prof_rating = "",
    prof_name = fullName,
    profUrl = `https://www.ratemyprofessors.com/search/teachers?query=${fullName}&sid=U2Nob29sLTYwMQ==`;
  if (data) {
    num_ratings = data["tNumRatings"];
    prof_rating = data["overall_rating"] + " / 5.0 ";
    prof_name = data["tFname"] + " " + data["tLname"];
    profUrl =
      "https://www.ratemyprofessors.com/ShowRatings.jsp?tid=" + data["tid"];
  }
  const rating_div = document.createElement("div");
  rating_div.className = "rating";
  const rating_a = document.createElement("a");
  rating_a.href = profUrl;
  rating_a.target = "_blank";
  rating_a.innerText =
    prof_name + ": " + prof_rating + "(" + num_ratings + " ratings)";
  rating_div.appendChild(rating_a);
  element.parentNode.appendChild(rating_div);
}

async function updateProfData(element, fullName) {
  let data;
  if (profDict.has(fullName)) {
    data = profDict.get(fullName);
  } else {
    data = await fetchProfData(fullName);
    profDict.set(fullName, data);
  }
  await updateElement(element, data, fullName);
}

async function checkRatingInPage() {
  if (document.getElementsByClassName("rating").length > 0) {
    return false;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function changePage() {
  let target = document.getElementsByClassName("ml-2");
  if (
    document.getElementsByClassName("rating").length > 0 ||
    target.length == 0
  ) {
    return false;
  }
  try {
    for (let i = 0; i < target.length; i++) {
      if (!["", "ps-htmlarea"].includes(target[i].parentNode.className)) {
        return false;
      }
      const textElement = target[i].textContent.trim();
      if (
        [
          "Open",
          "Closed",
          "To Be Announced",
          "Reserved Capacity",
          "Cross Listed",
          "Wait List",
        ].includes(textElement) ||
        textElement.indexOf("/") > -1
      ) {
        continue;
      }
      target[i].style.textDecoration = "none";
      let fullNames;
      if (textElement.indexOf(",") > -1) {
        fullNames = textElement.split(", ");
      } else {
        fullNames = [textElement];
      }
      if (fullNames[0]) {
        for (let k = 0; k < fullNames.length; k++) {
          updateProfData(target[i], fullNames[k]);
        }
      }
    }
    return true;
  } catch (err) {
    console.log("An error occured: " + err);
    return false;
  }
}

const config = {
  subtree: true,
  childList: true,
  characterData: true,
};

const observer = new MutationObserver((mutations) => {
  console.log(changePage());
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.method == "start") {
    observer.observe(document, config);
    sendResponse({
      received: "start",
    });
  } else if (request.method == "stop") {
    observer.disconnect();
    sendResponse({
      received: "stop",
    });
  }
});
