let state = 0
let eyeL = [`
M15.7,36.3c2.2,0.4,4.5,0.5,6.7,0l0.7-0.1c0.3-0.1,0.6,0.2,0.4,0.5c-0.6,1.8-2.4,3.1-4.4,3.1
		c-2,0-3.7-1.3-4.4-3.1c-0.1-0.3,0.2-0.6,0.5-0.5L15.7,36.3z`,
 `M34.8,28.2c0,0,1.4-1.1,3.4,0c0,0,0,0,0,0c0.6,0.6,1.1,1.3,1.1,2.1v0.3c0,0,0,2.9-2.5,2.9c-3.4,0-3-2.8-3-2.8
		l0-0.6C33.8,29.4,34.2,28.6,34.8,28.2L34.8,28.2z` 
];
let eyeR = [`M36.9,36.3c2.2,0.4,4.5,0.5,6.7,0l0.7-0.1c0.3-0.1,0.6,0.2,0.4,0.5c-0.6,1.8-2.4,3.1-4.4,3.1
		c-2,0-3.7-1.3-4.4-3.1c-0.1-0.3,0.2-0.6,0.5-0.5L36.9,36.3z`,
 `M58.6,28.2c0,0,1.4-1.1,3.4,0c0,0,0,0,0,0c0.6,0.6,1.1,1.3,1.1,2.1v0.3c0,0,0,2.9-2.5,2.9c-3.4,0-3-2.8-3-2.8
		l0-0.6C57.6,29.4,58,28.6,58.6,28.2L58.6,28.2z` 
]

let mouth = [
  `M26.1,50.9c-0.7,0-1,0.8-0.6,1.3c0.5,0.6,1.5,1,2.5,1c1.2,0,2.2-0.5,2.7-1.2c0.3-0.5-0.1-1.1-0.6-1.1H26.1z
`,
  `M61.7,41.9c0.1,0.4,0.2,0.9,0.2,1.3c0,5.1-6,9.2-13.3,9.2c-7.4,0-13.3-4.1-13.3-9.2c0-0.5,0.1-0.9,0.2-1.3
		H61.7z`
]


let snap = Snap('#face')

function animatePath(){

    state = 3
    	snap.animate({ transform: 't88'  }, 800, customBezier(0.79,-0.03,0.15,1.02,(1000 / 60 / 800) / 4));

  setTimeout(()=>{
     document.getElementById("toggle-wrapper").classList.remove("disable")   
               document.getElementById("toggle-wrapper").classList.add("active")
                                       
      	snap.select("#items").animate({ transform: 't88'  }, 600, customBezier(0.79,-0.03,0.15,1.02,(1000 / 60 / 600) / 4),()=>{
          

          
          	snap.select("#items").animate({ transform: 't-45'  }, 0,0,()=>{
              
              snap.select("#items").animate({ transform: 't00s0.9,1.4'  }, 150,customBezier(0.01,0.54,0.1,1.01,(1000 / 60 / 150) / 4))
              setTimeout(()=>{
                              snap.select("#items").animate({ transform: 't00s1,1'  }, 100)
                
              },100)
              
              	snap.select("#eyeL").animate({ d: eyeL[1] }, 150, customBezier(0.01,0.54,0.1,1.01,(1000 / 60 / 150) / 4));
              
  	snap.select("#eyeR").animate({ d: eyeR[1] }, 150, customBezier(0.01,0.54,0.1,1.01,(1000 / 60 / 150) / 4));
              
  	snap.select("#mouth").animate({ d: mouth[1] }, 150, customBezier(0.01,0.54,0.1,1.01,(1000 / 60 / 150) / 4),()=>{
      state = 1
    });
              

                      

            }) 
          
        }); 

  },100)

} 
function resetAnimatePath(){
  
        state = 3

    	snap.animate({ transform: 't00'  }, 800, customBezier(0.79,-0.03,0.15,1.02,(1000 / 60 / 800) / 4));
                          
  setTimeout(()=>{
     document.getElementById("toggle-wrapper").classList.remove("active") 
   document.getElementById("toggle-wrapper").classList.add("disable")
                           
      	snap.select("#items").animate({ transform: 't-88'  }, 600, customBezier(0.79,-0.03,0.15,1.02,(1000 / 60 / 600) / 4),()=>{
          

          
          	snap.select("#items").animate({ transform: 't45'  }, 0,0,()=>{
              
              snap.select("#items").animate({ transform: 't00s1.2,0.8'  }, 200,customBezier(0.01,0.54,0.1,1.01,(1000 / 60 / 300) / 4))
              setTimeout(()=>{
                              snap.select("#items").animate({ transform: 't00s1,1'  }, 100)
                
              },100)
              
              	snap.select("#eyeL").animate({ d: eyeL[0] }, 250, customBezier(0.01,0.54,0.1,1.01,(1000 / 60 / 300) / 4));
              
  	snap.select("#eyeR").animate({ d: eyeR[0] }, 250, customBezier(0.01,0.54,0.1,1.01,(1000 / 60 / 250) / 4));
              
  	snap.select("#mouth").animate({ d: mouth[0] }, 250, customBezier(0.01,0.54,0.1,1.01,(1000 / 60 / 250) / 4),()=>{
      state = 0
    });
              

              
            }) 
          
        });    
  },100)
} 

document.getElementById("toggle-wrapper").addEventListener("click", ()=>{
  console.log(state);
  if(state === 0){
    animatePath();
  }else if(state === 1){
    resetAnimatePath();
  }
});




function customBezier(x1, y1, x2, y2, epsilon){

	var curveX = function(t){
		var v = 1 - t;
		return 3 * v * v * t * x1 + 3 * v * t * t * x2 + t * t * t;
	};

	var curveY = function(t){
		var v = 1 - t;
		return 3 * v * v * t * y1 + 3 * v * t * t * y2 + t * t * t;
	};

	var derivativeCurveX = function(t){
		var v = 1 - t;
		return 3 * (2 * (t - 1) * t + v * v) * x1 + 3 * (- t * t * t + 2 * v * t) * x2;
	};

	return function(t){

		var x = t, t0, t1, t2, x2, d2, i;

		// First try a few iterations of Newton's method -- normally very fast.
		for (t2 = x, i = 0; i < 8; i++){
			x2 = curveX(t2) - x;
			if (Math.abs(x2) < epsilon) return curveY(t2);
			d2 = derivativeCurveX(t2);
			if (Math.abs(d2) < 1e-6) break;
			t2 = t2 - x2 / d2;
		}

		t0 = 0, t1 = 1, t2 = x;

		if (t2 < t0) return curveY(t0);
		if (t2 > t1) return curveY(t1);

		// Fallback to the bisection method for reliability.
		while (t0 < t1){
			x2 = curveX(t2);
			if (Math.abs(x2 - x) < epsilon) return curveY(t2);
			if (x > x2) t0 = t2;
			else t1 = t2;
			t2 = (t1 - t0) * .5 + t0;
		}

		// Failure
		return curveY(t2);

	};

};