"use strict";

function mainClick(evt) {
    openQuiz(evt.target.innerText)
}
function mainMenu(evt) {
    openQuiz(evt.target.value)
}
function openQuiz(q) {
    quiz.hidden = false
    readText('sinav'+'/'+q, makeData)
    title.innerText = q
}
function readText(u, callback) {
    fetch(u+".txt").then(r => r.text())
    .then(t => callback(t.split('\n')))
}
function makeData(a) {
    data.length = 0  //clear
    console.assert(a.length%7 == 0)
    for (let i=0; i<a.length; i+=7) {
        let soru = a[i].trim()
        let liste = []
        for (let k=1; k<6; k++) //trim A..E & \r
            liste.push(a[i+k].substring(3).trim())
        let dogru = a[i+6].charCodeAt(0)-65
        //String.fromCharCode(65+dogru)
        console.assert(dogru>=0 && dogru<5)
        data.push({soru, dogru, liste})
    }
    // out2.innerText = data.length+' soru -- '+VERSION
    nc = 0; ne = 0; display(0)  //start
    score.innerText = '.'
}
function display(k) { //k is question number minus one
    clearTimeout(time)
    if (k<0 || k>=data.length) {
      closeQuiz(); return
    }
    current = k; let d = data[k]
    question.innerText = d.soru
    result.innerText = ''
    let used = new Set()
    for (let x of LI) { //randomize items
      let i
      do { //find random index of next item
        i = Math.trunc(5*Math.random())
      } while (used.has(i))
      used.add(i)
      x.innerText = d.liste[i]
      x.correct = (i == d.dogru)
      setStyle(x)
    }
}
function setStyle(x) {
    let d = data[current]
    if (x.innerText == d.cevap) {
      let OK = (d.cevap == d.liste[d.dogru])
      x.style.background = OK? '#118' : '#a00'
      x.style.color = '#ffd'
    } else { //use default colors
      x.style = ''
    }
}
function showAnswer() {
    let x = LI.find(e => e.correct)
    if (!x) return
    x.style.background = '#afa' //light green
}
function checkAnswer(evt) {
    let x = evt.target
    if (x.tagName != 'LI') return
    let d = data[current]
    if (d.cevap) return //already answered
    d.cevap = x.innerText
    setStyle(x)
    let s1 = '', s2 = ''
    if (x.correct) {
      s1 = 'Doğru!'; s2 = "#000"; nc++
    } else {
      s1 = 'Olmadı'; s2 = "#b00"; ne++
      showAnswer()
    }
    result.innerText = s1
    result.style.color = s2
    score.innerText = nc+' Doğru, '+ne+' Yanlış'
    time = setTimeout(() => rightB.onclick(), 3000)
}
function closeQuiz() {
  function confirmClose() {
    let s = result.innerText +'\n\nDevam edelim mi?'
    if (!confirm(s)) quiz.hidden = true
    else result.innerText = ''
  }
    let i = data.findIndex(e => !e.cevap)
    if (i >= 0) { //incomplete
      display(i)
      let s = (i+1)+'. soru eksik'
      result.innerText = s
      setTimeout(confirmClose, 3)
    } else { //OK, close the page
      alert('Sınav tamamlandı \n\n'+score.innerText) 
      quiz.hidden = true
    }
  }
function doKey(evt) {
    let k = evt.key.toUpperCase()
    switch (k) {
        case 'A':
            a0.click(); break
        case 'B':
            a1.click(); break
        case 'C':
            a2.click(); break
        case 'D':
            a3.click(); break
        case 'E':
            a4.click(); break
        case 'HOME':
            display(0); break
        case 'END':
            closeQuiz(); break
        case 'ARROWLEFT':
            leftB.click(); break
        case 'ESCAPE':
            answer.click(); break
        case 'ARROWRIGHT':
            rightB.click(); break
        default: return
    }
}
    const VERSION = "V0.5"
    const LI = [...items.querySelectorAll('LI')]
    const data = []  //Array of objects
    var current, //item number >=0
      nc,   //number of correct answers
      ne,   //number of wrong answers
      time  //value returned from setTimeout
    out.innerText = VERSION
    leftB.onclick  = () => {display(current-1)}
    answer.onclick = showAnswer
    rightB.onclick = () => {display(current+1)}
    items.onclick = checkAnswer
    files.onclick = mainClick
    menu.onchange = mainMenu
    document.onkeydown = doKey
