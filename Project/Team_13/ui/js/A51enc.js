var keyele=document.getElementById('inputKey');
var frameele=document.getElementById('inputFrame');

var inpmessu1=document.getElementById('inpmessu1');
var outmessu1=document.getElementById('outmessu1');

var inpmessu2=document.getElementById('inpmessu2');
var outmessu2=document.getElementById('outmessu2');

//required prerequisites
const hexToDecimal = hex => parseInt(hex, 16);

const R1Mask=hexToDecimal("0x07FFFF");
const R2Mask=hexToDecimal("0x3FFFFF");
const R3Mask=hexToDecimal("0x7FFFFF");

const R1mid = hexToDecimal("0x000100");
const R2mid = hexToDecimal("0x000400");
const R3mid = hexToDecimal("0x000400");

const R1taps = hexToDecimal("0x072000");
const R2taps = hexToDecimal("0x300000");
const R3taps = hexToDecimal("0x700080");

const R1OUT = hexToDecimal("0x040000");
const R2OUT = hexToDecimal("0x200000");
const R3OUT = hexToDecimal("0x400000");

var R1,R2,R3;
var AtoB=[],BtoA=[];
var aTob,bToa;




function hexchartoval(ch){
    const hexchar="0123456789ABCDEF";
    j=0;
    for(i=0;i<hexchar.length;i++){
        if(ch==hexchar[i]){
            j=i;
            break;
        }
    }
    if(j==-1){
        console.log("Invalid Input");
        return 0;
    }
    else{
        return j;
    }
}
function str_to_hex(str){
    var len=str.length;
    var rv=0;
    
    for(var i=len-1;i>=0;i--){
        s=str[i];
        //console.log(s);
        nibble=hexchartoval(s);
        //console.log(nibble);
        
        if(i>1){
            nibble |= hexchartoval(str[i - 1]) << 4;
           //console.log("afterlen:"+nibble);
        }
        rv |= nibble << (((len - i-1)) * 4);
        //console.log("rv"+rv+" ");
    }
    //console.log("\n"+rv);
    return rv
}
function parity(x){
    x ^= x>>16;
	x ^= x>>8;
	x ^= x>>4;
	x ^= x>>2;
	x ^= x>>1;
	return x&1;
}

function clockone(reg,mask,tap){
    var t=reg&tap;
    //console.log(reg," ",tap," ",t);
    reg = (reg << 1) & mask;
	reg |= parity(t);
	return reg;
}

function clockallthree(){
    R1=clockone(R1,R1Mask,R1taps);
    R2=clockone(R2,R2Mask,R2taps);
    R3=clockone(R3,R3Mask,R3taps);
}
function majority(){
	sum = parity(R1&R1mid) + parity(R2&R2mid) + parity(R3&R3mid);
	if (sum >= 2)
		return 1;
	else
		return 0
}
function clock(){
	maj = majority();
	if (((R1&R1mid)!=0) == maj)
		R1 = clockone(R1, R1Mask, R1taps);
	if (((R2&R2mid)!=0) == maj)
		R2 = clockone(R2, R2Mask, R2taps);
	if (((R3&R3mid)!=0) == maj)
		R3 = clockone(R3, R3Mask, R3taps);
}

function keysetup(key,frame){
    R1=R2=R3=0;
    var keybit,framebit;
    let i=0;
    for(i=0;i<64;i++){
        clockallthree();
        keybit = (key[Math.floor(i/8)] >> (i&7)) & 1;
        R1 ^= keybit; R2 ^= keybit; R3 ^= keybit;
    }
    
    for (i=0; i<22; i++) {
		clockallthree(); /* always clock */
		framebit = (frame >> i) & 1; /* The i-th bit of the frame #
	*/
		R1 ^= framebit; R2 ^= framebit; R3 ^= framebit;
	}
    /*console.log(R1);
    console.log(R2);
    console.log(R3);*/
    for (i=0; i<100; i++) {
		clock();
	}
    //console.log(R1,"\t",R2,"\t",R3,"\t");
}
function getbit(){
    return parity(R1&R1OUT)^parity(R2&R2OUT)^parity(R3&R3OUT);
}
function run(AtoB,BtoA){
    let i;
    for(i=0;i<=Math.floor(113/8);i++){
        AtoB[i]=BtoA[i]=0;
    }
    for (i=0; i<114; i++) {
		clock();
		AtoB[Math.floor(i/8)] |= getbit() << (7-(i&7));
	}
    for (i=0; i<114; i++) {
		clock();
		BtoA[Math.floor(i/8)] |= getbit() << (7-(i&7));
	}
    //console.log(AtoB);
    //console.log(BtoA);
}

function generateKey(hex,f){
    //This section is for key conversion
    key=[];
    for(j=0;j<16;j++){
        hexstring=hex.slice(j,j+2);
        hexstring=parseInt(hexstring,16);
        key[j]=hexstring
    }
    for(j=1;j<16;j+=2){
        key[j]=0;
    }
    key=key.filter(i=>i!==0);
    //console.log(key);
    frame=str_to_hex(f);
    //console.log(frame);

    var failed=0;
    keysetup(key,frame);
    run(AtoB,BtoA);
    
    
    let out="key: 0x"
    for (let i = 0; i < 8; i++) {
        out+=key[i].toString(16).padStart(2, '0').toUpperCase();
    }
    console.log(out.trim());
    console.log("frame number: 0x" + frame.toString(16).padStart(6, '0').toUpperCase());

    console.log("observed output:");
    out=" A->B: 0x"
    for(i=0; i<15; i++){
        out+=AtoB[i].toString(16).padStart(2, '0').toUpperCase();
    }
    console.log(out.trim());
    aTob=out.trim();
    aTob=aTob.replace("A->B: 0x","")

    out=" B->A: 0x"
    for(i=0; i<15; i++){
        out+=BtoA[i].toString(16).padStart(2, '0').toUpperCase();
    }
    console.log(out.trim());
    bToa=out.trim();
    bToa=bToa.replace("B->A: 0x","");
}

function ascii_to_val(str)
  {
	var arr1 = [];
	for (var n = 0, l = str.length; n < l; n ++) 
     {
		var hex = Number(str.charCodeAt(n)).toString(10);
        hex=parseInt(hex,10);
		arr1.push(hex);
	 }
	return arr1;
}
function val_to_ascii(list){
    var str="";
    str = String.fromCharCode.apply(null, list);
    return str;
}

function EncandDec(key,message){
    var plain=ascii_to_val(message);
    var enc=[]
    for(i=0;i<plain.length;i++){
        enc[i]=plain[i]^key[i]
    }
    enc=val_to_ascii(enc)
    return enc;
}

function generatekey(){
    var key=keyele.value.trim();
    var frame=frameele.value.trim();
    if(key!="" && frame!=""){
        generateKey(key,frame);
        alert("Key generated");
    }
    else if(key==""){
        alert("Please Enter a 64-bit key:");
    }
    else if(frame==""){
        alert("Please enter a frame value(I.V)");
    }
    else{
        alert("No input given");
    }
    
}

function encryptu1(){ //will be executed when button is clicked
    var message=inpmessu1.value.trim();
    console.log(message);
    if(AtoB.len!=0 && message!=""){
        var enc1=EncandDec(AtoB,message);
        outmessu1.value=enc1;
    }
    else if(message==""){
        alert("No message given!");
    }
    else if(AtoB.len!=0){
        alert("No Key given");
    }
    else{
        alert("Error Error 101")
    }
}
function decryptu1(){ //will be executed when button is clicked
    var message=inpmessu1.value.trim();
    console.log(message);
    if(BtoA.len!=0 && message!=""){
        var enc1=EncandDec(BtoA,message);
        outmessu1.value=enc1;
    }
    else if(message==""){
        alert("No message given!");
    }
    else if(AtoB.len!=0){
        alert("No Key given");
    }
    else{
        alert("Error Error 101")
    }
}
function encryptu2(){ //will be executed when button is clicked
    var message=inpmessu2.value.trim();
    console.log(message);
    if(BtoA.len!=0 && message!=""){
        var enc1=EncandDec(BtoA,message);
        outmessu2.value=enc1;
    }
    else if(message==""){
        alert("No message given!");
    }
    else if(AtoB.len!=0){
        alert("No Key given");
    }
    else{
        alert("Error Error 101")
    }
}
function decryptu2(){ //will be executed when button is clicked
    var message=inpmessu2.value.trim();
    console.log(message);
    if(AtoB.len!=0 && message!=""){
        var enc1=EncandDec(AtoB,message);
        outmessu2.value=enc1;
    }
    else if(message==""){
        alert("No message given!");
    }
    else if(AtoB.len!=0){
        alert("No Key given");
    }
    else{
        alert("Error Error 101")
    }
}

//2c17813224f8c789
//137