"use strict";
const VERSION = 'V1.00'

class Question {
  constructor(soru, dogru, liste) {
    this.soru = soru; this.dogru = dogru; 
    this.cevap = null; this.liste = liste
  }
  correctAnswer() { return this.dogru == this.cevap }
  wrongAnswer() { 
    return this.cevap !== null && this.dogru !== this.cevap 
  }
  toString() { return this.soru }
}

function readJSON(u, callback) {
    fetch(u).then(r => r.json())
    .then(t => callback(t))
}
function fileList(list) {
    const local = localStorage.ekpssList
    if (!list) { //initial call
      if (!local) return //wait for current data
      list = JSON.parse(local)
      console.log('initial call -- using local data')
    } else { //second call
      list = list.map( d => d.name.substring(0, d.name.length-4))
      let s = JSON.stringify(list)
      if (s == local) return //nothing new
      localStorage.ekpssList = s
      console.log('second call -- current data saved')
    }
    const SPAN = ' <span></span> <br>\n'
    // const LI = '</li>'+SPAN+'<li>'
    // let s = '<li>'+list.join(LI)+'</li>'+SPAN
    for (let q of list) {
      let id = q.substring(0, 2) //first two chars
      let e = main.querySelector('#'+id)
      if (e) e.innerHTML += '<li>'+q+'</li>'+SPAN
    }
    initScores(); console.log(DE.innerHTML)
}
fileList()  //initial call gets the list from localStorage
const GITHUB = 'https://api.github.com/repos/ozfloyd/EKPSS/contents/'
readJSON(GITHUB+'sinav/', fileList)  //second call -- current data

function getHashName() {
    if (!location.hash) return ''
    //omit first char '#'
    return decodeURI(location.hash).substring(1)    
}
function openQuiz(evt) {
    quiz.hidden = false; quizButton = evt.target
    location.hash = quizButton.innerText
}
function gotoHashPage() { //called when hash is modified
    let q = getHashName(); if (!q) return
    readText('sinav'+'/'+q+'.txt', makeData)
    document.title = q; title.innerText = q
}
function readText(u, callback) {
    fetch(u).then(r => r.text())
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
        data.push(new Question(soru, dogru, liste))
      //data.push({soru, dogru, liste})
    }
    score.innerText = '.'
    nc = 0; ne = 0; display(0)  //start
    let q = quizButton? 
        quizButton.innerText : getHashName()
    let u = readStorage()[q] || []
    if (u.length == 0) return
    let s = u.pop()
    setScore(quizButton, s); score.innerText = s
    for (let i=0; i<data.length; i++) {
        if (u[i] === null) continue
        let d = data[i]; d.cevap = u[i]
        if (d.correctAnswer()) nc++
        if (d.wrongAnswer()) ne++
    }
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
      used.add(i); x.numara = i
      x.innerText = d.liste[i]
      setStyle(x)
    }
    quiz.hidden = false
}
function setStyle(x) {
    let d = data[current]
    if (d.cevap == x.numara) {
      let OK = (d.correctAnswer())
      x.style.background = OK? '#118' : '#a00'
      x.style.color = '#ffd'
    } else { //use default colors
      x.style = ''
    }
}
function showAnswer() {
    let d = data[current]
    let x = LI.find(x => d.dogru == x.numara)
    if (!x) return
    x.style.background = '#afa' //light green
}
function checkAnswer(evt) {
    let x = evt.target
    if (x.tagName != 'LI') return
    let d = data[current]
    if (d.cevap !== null) return //already answered
    d.cevap = x.numara
    setStyle(x)
    let s1 = '', s2 = ''
    if (d.correctAnswer()) {
      s1 = 'Doğru!'; s2 = "#000"; nc++
    } else {
      s1 = 'Olmadı'; s2 = "#b00"; ne++
      showAnswer()
    }
    result.innerText = s1; result.style.color = s2
    let t = nc+' Doğru, '+ne+' Yanlış'
    setScore(quizButton, t); score.innerText = t
    time = setTimeout(() => rightB.onclick(), 3000)
}
function closeQuiz() {
  function doClose() {
    quiz.hidden = true; quizButton = null; location.hash=''
  }
  function confirmClose() {
    let s = result.innerText +'\n\nSınavı kapatalım mı?'
    if (confirm(s)) doClose()
    else result.innerText = ''
  }
    let i = data.findIndex(d => d.cevap === null)
    if (i >= 0) { //incomplete
      display(i)
      let s = (i+1)+'. soru eksik'
      result.innerText = s
      setTimeout(confirmClose, 10)
    } else { //OK, close the page
      let s = score.innerText
      alert('Sınav tamamlandı \n\n'+s) 
      doClose()
      let u = data.map(d => d.cevap)
      u.push(s) //store s
      setStorage(title.innerText, u)
    }
}
function readStorage() {
    return localStorage.ekpss? 
      JSON.parse(localStorage.ekpss) : {}
}
function getStorage(key) {
    return readStorage()[key]
}
function setStorage(key, value) {
    let x = readStorage()
    x[key] = value
    localStorage.ekpss = JSON.stringify(x)
}
function clearStorage() {
    delete localStorage.ekpss
    for (let e of main.querySelectorAll('span'))
        e.innerText = ''
}
function setScore(elt, s) {
    elt.nextElementSibling.innerText = s
}
function initScores() {
    let u = readStorage()
    for (let e of main.querySelectorAll('li')) {
      let q = e.innerText
      if (u[q]) setScore(e, u[q].pop())
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
    evt.preventDefault()
}
function resize() {
    let margin = (w) => Math.trunc((W-w)/2)
    let W = window.innerWidth
    let w1 = main.clientWidth
    let w2 = quiz.clientWidth || 420
    let x1 = 0, x2 = 0
    if (w1+w2 < W) { //large
      x1 = margin(w1+w2); x2 = x1+w1
    } else { //narrow
      x1 = margin(w1); x2 = x1
    }
    main.style.left = x1+"px"
    quiz.style.left = x2+"px"
    //console.log('resize', W, x1, x2)
}
    const LI = [...items.querySelectorAll('LI')]
    const data = []  //Array of Question objects
    var current,  //Question number >=0
      quizButton, //Element that started quiz
      nc,   //number of correct answers
      ne,   //number of wrong answers
      time  //value returned from setTimeout
    out.innerText = VERSION
    leftB.onclick  = () => { display(current-1) }
    answer.onclick = showAnswer
    rightB.onclick = () => { display(current+1) }
    items.onclick = checkAnswer
    main.onclick = openQuiz
    clear.onclick = clearStorage
    // menu.onchange = mainMenu
    document.onkeydown = doKey
    window.onhashchange = gotoHashPage
    window.onresize = resize
    resize(); gotoHashPage()
