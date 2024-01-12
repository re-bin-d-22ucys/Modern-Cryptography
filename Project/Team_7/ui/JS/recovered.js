let isInView = (elementClassName) => {
    const revealPoint = 150;
    const windowHeight = window.innerHeight;
    const elem = document.querySelectorAll(elementClassName);
    
    for(var item = 0; item < elem.length; item++){
      
      var revealTop = elem[item].getBoundingClientRect().top;
      var revealBottom = elem[item].getBoundingClientRect().bottom;
      
      if(revealTop < windowHeight - revealPoint){
        elem[item].classList.remove('faded_out');
      }else{
        elem[item].classList.add('faded_out');
      }
      
      if(revealBottom < 0 - revealPoint){
        elem[item].classList.add('faded_out');
      }
    }
  };
  
  let handleEvent = (event) => {
    // console.log("scrolling");
    isInView('.reveal');
  }
  
  window.addEventListener('scroll', handleEvent);