const timer = (time,fn) =>{
  time = time * 1000;
  return new Promise(resolve => {
    resolve( setTimeout(fn,time))
  }) 
}

const log = (text,text2) => {
  const debugMode = false;
  debugModeEnabled = () => {
    return debugMode;
  }
  debugModeEnabled() && console.log(text,text2)
}

var transitionCount = 0;
const transitions = () =>{
  let heightRatio = window.scrollY / window.innerHeight; 
  sections = document.querySelectorAll("section");
  //log(heightRatio + " - " + parseInt(heightRatio) + " = ", heightRatio - parseInt(heightRatio) );
  addTransition(heightRatio,sections);
};

const addTransition = (heightRatio,sections) => {
  let item = heightRatio;

  if ( heightRatio > 0.65 && transitionCount < 1 ){
  sections[1].style.visibility="visible";
  console.log(sections[1].style.display);
  sections[1].style.display="none";
  
    transitionCount++;
    timer(.1, ()=>{
      sections[1].style.display="inherit";
    });
  }

  if ( heightRatio > 1.75 && transitionCount < 2 ){
  sections[2].style.visibility="visible";
  console.log(sections[1].style.display);
  sections[2].style.display="none";
    transitionCount++;
    timer(.1, ()=>{
      sections[2].style.display="inherit";
    });
    timer(.5,()=>{
    sections[3].style.display="none";
    })
  }
};

function third(){
  sections[2].style.visibility="visible";
  sections[2].style.display="none";
  sections[2].style.display="inherit";

  timer(.1, ()=>{
    sections[2].style.display="inherit";
  });
}


timer(.1,()=>{ 
  document.querySelectorAll("section").forEach((item,index)=>{
    item.style.display="inherit";
    if (index == 0) item.style.visibility="inherit";
  });
});

document.onscroll = transitions;
