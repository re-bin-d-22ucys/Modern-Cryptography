let mk = []; // list of master key
let wk = []; // list of whitening key
let s = [0, 1, 0, 1, 1, 0, 1];
let d = [];
let sk = new Array(128).fill(0);
let x = new Array(8).fill(0);

let key = "";
let pt = [];
let plainText = "";
let ct = [];
let cipherText = "";

function f0(val) {
    val=val.toString(2).padStart(8, '0');
    let ans = parseInt(val[1]+val[2]+val[3]+val[4]+val[5]+val[6]+val[7]+val[0],2) ^ parseInt(val[2]+val[3]+val[4]+val[5]+val[6]+val[7]+val[0]+val[1],2) ^ parseInt(val[7]+val[0]+val[1]+val[2]+val[3]+val[4]+val[5]+val[6],2)
    return ans;
}

function f1(val) {
    val=val.toString(2).padStart(8, '0');
    let ans = parseInt(val[3]+val[4]+val[5]+val[6]+val[7]+val[0]+val[1]+val[2],2) ^ parseInt(val[4]+val[5]+val[6]+val[7]+val[0]+val[1]+val[2]+val[3],2) ^ parseInt(val[6]+val[7]+val[0]+val[1]+val[2]+val[3]+val[4]+val[5],2)
    return ans;
}

function generateMkWk() {
    for (let i = 0; i < key.length; i=i+2) {
        mk.push(key.slice(i, i + 2));
    }

    mk = mk.map(item => {
        return parseInt(item, 16);
    });

    let tmp = [];
    for (let i = 0; i < key.length; i += 2) {
        tmp.push(key.slice(i, i + 2));
    }

    for (let i = 12; i < 16; i++) {
        wk.push(parseInt(tmp[i], 16));
    }

    for (let i = 0; i < 4; i++) {
        wk.push(parseInt(tmp[i], 16));
    }
}

function generateSD() {
    let tmpD = [s[6], s[5], s[4], s[3], s[2], s[1], s[0]];
    let tmp2D = tmpD.join('');
    d.push(tmp2D);

    for (let i = 1; i < 128; i++) {
        let tmpS = s[i + 2] ^ s[i - 1];
        tmpD = [tmpS, s[i + 5], s[i + 4], s[i + 3], s[i + 2], s[i + 1], s[i]];
        tmp2D = tmpD.join('');
        s.push(tmpS);
        d.push(tmp2D);
    }
    for (let i=0;i<d.length;i++){
        d[i]=parseInt(d[i],2);
    }
}

function generateSK() {
    let mkReversed = mk.slice().reverse();

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            mod=(j - i) % 8;
            if (mod<0){
                mod=mod+8;
            }
            sk[16 * i + j] = ( mkReversed[mod] + d[16 * i + j]) % 256;
        }

        for (let j = 0; j < 8; j++) {
            mod=(j - i) % 8;
            if (mod<0){
                mod=mod+8;
            }
            sk[16 * i + j + 8] = (mkReversed[mod+ 8] + d[16 * i + j + 8]) % 256;
        }
    }
}

function hexToAscii(hexString) {
    let asciiString = '';
    for (let i = 0; i < hexString.length; i += 2) {
      let hexValue = hexString.substr(i, 2);
      let decimalValue = parseInt(hexValue, 16);
      asciiString += String.fromCharCode(decimalValue);
    }
    return asciiString;
}

function asciiToHex(str) {
    let hexArray = [];
    for (let i = 0; i < str.length; i++) {
      let hexValue = str.charCodeAt(i).toString(16);
      hexArray.push(hexValue);
    }
    return hexArray.join('');
}

// -----------------------------------encryption part-------------------------------------

function initial_enc() {
    for (let i = 0; i < plainText.length; i += 2) {
        pt.push(plainText.slice(i, i + 2));
    }

    pt = pt.map(item => {
        return parseInt(item, 16).toString(2).padStart(8, '0');
    });

    for (let i=0;i<pt.length;i++){
        pt[i]=parseInt(pt[i],2);
    }

    pt.reverse();
    wk.reverse();

    x[0] = (pt[0] + wk[0]) % 256;
    x[2] = (pt[2] ^ wk[1]);
    x[4] = (pt[4] + wk[2]) % 256;
    x[6] = (pt[6] ^ wk[3]);
    x[1] = pt[1];
    x[3] = pt[3];
    x[5] = pt[5];
    x[7] = pt[7];
}

function encryption() {
    for (let i = 0; i < 31; i++) {
        let tmpX = [...x];
        x[0] = (tmpX[7]) ^ ((f0(tmpX[6]) + sk[4 * i + 3]) % 256);
        x[2] = (tmpX[1] + (f1(tmpX[0]) ^ sk[4 * i + 2])) % 256;
        x[4] = (tmpX[3]) ^ ((f0(tmpX[2]) + sk[4 * i + 1]) % 256);
        x[6] = (tmpX[5] + (f1(tmpX[4]) ^ sk[4 * i])) % 256;
        x[1] = tmpX[0];
        x[3] = tmpX[2];
        x[5] = tmpX[4];
        x[7] = tmpX[6];
    }

    let tmpX = [...x];
    x[0] = tmpX[0];
    x[2] = tmpX[2];
    x[4] = tmpX[4];
    x[6] = tmpX[6];
    x[1] = (tmpX[1] + (f1(tmpX[0]) ^ (sk[124]))) % 256;
    x[3] = (tmpX[3]) ^ ((f0(tmpX[2]) + sk[125]) % 256);
    x[5] = (tmpX[5] + (f1(tmpX[4]) ^ (sk[126]))) % 256;
    x[7] = (tmpX[7]) ^ ((f0(tmpX[6]) + sk[127]) % 256);
}

function final_enc() {
    let x32 = [...x];
    x[0] = (x32[0] + wk[4]) % 256;
    x[2] = x32[2] ^ wk[5];
    x[4] = (x32[4] + wk[6]) % 256;
    x[6] = x32[6] ^ wk[7];
    x[1] = x32[1];
    x[3] = x32[3];
    x[5] = x32[5];
    x[7] = x32[7];
}

function main_enc(){
    generateMkWk();
    generateSD();
    generateSK();
    initial_enc();
    encryption();
    final_enc();
}

function start_enc(){
    //key="ffeeddccbbaa99887766554433221100";
    key = document.getElementById('encryptKey').value;
    key = key.replace(/\s/g, '');

    //let tmp_plainText = "00112233445566771111223344556677";
    let tmp_plainText = document.getElementById('encryptPlainText').value;
    tmp_plainText = asciiToHex(tmp_plainText);
    
    //tmp_plainText = tmp_plainText.replace(/\s/g, '');
    //plainText="0011223344556677"
    
    rng=(16-((tmp_plainText.length)%16));
    for(let i=0;i<rng;i++){
        if (i==0){
            tmp_plainText=tmp_plainText+"8";
        }
        else{
            tmp_plainText=tmp_plainText+"0";
        }
    }
    
    z=0;y=16;
    let ciphertext = "Ciphertext:";
    //console.log(tmp_plainText)
    for(let i=1;i<(Math.floor(tmp_plainText.length/16))+1;i++){
        plainText=tmp_plainText.substring(z,y);
        main_enc();
        z=z+16;
        y=y+16;
        for (let i = 1; i <= 8; i++) {
            ciphertext = ciphertext +" "+ (x[x.length - i]).toString(16).padStart(2, '0');
        }
        
        //restoring global variables 
        mk = [];wk = [];
        s = [0, 1, 0, 1, 1, 0, 1];
        d = [];pt = [];
        sk = new Array(128).fill(0);
        x = new Array(8).fill(0);
        plainText = "";
    }
    key = "";
    console.log(ciphertext);
    document.getElementById('encryptionResult').innerHTML = ciphertext;    
}


// -----------------------------------decryption part-------------------------------------

function initial_dec() {
    for (let i = 0; i < cipherText.length; i += 2) {
        ct.push(cipherText.substring(i, i + 2));
    }
    for (let i = 0; i < ct.length; i++) {
        ct[i] = parseInt(ct[i], 16).toString(2).padStart(8, '0');
    }
    for (let i = 0;i<ct.length;i++){
        ct[i]=parseInt(ct[i],2);
    }
    
    let CT = ct.slice().reverse();
    let WK = wk.slice().reverse();
    x[0] = ((CT[0] - WK[4])+256) % 256;
    x[2] = (CT[2] ^ WK[5]);
    x[4] = ((CT[4] - WK[6])+256) % 256;
    x[6] = (CT[6] ^ WK[7]);
    x[1] = CT[1];
    x[3] = CT[3];
    x[5] = CT[5];
    x[7] = CT[7];
}

function decryption() {
    let tmp_x = [...x];
    x[0] = tmp_x[0];
    x[2] = tmp_x[2];
    x[4] = tmp_x[4];
    x[6] = tmp_x[6];
    x[1] = ((tmp_x[1]) - (f1(tmp_x[0]) ^ sk[124]) + 256) % 256;
    x[3] = (tmp_x[3]) ^ (((f0(tmp_x[2])) + (sk[125])) % 256);
    x[5] = ((tmp_x[5]) - (f1(tmp_x[4]) ^ sk[126]) + 256) % 256;
    x[7] = (tmp_x[7]) ^ (((f0(tmp_x[6])) + (sk[127])) % 256);

    for (let i = 30; i >= 0; i--) {
        tmp_x = [...x];
        x[0] = tmp_x[1];
        x[2] = tmp_x[3];
        x[4] = tmp_x[5];
        x[6] = tmp_x[7];
        x[1] = ((tmp_x[2]) - (f1(x[0]) ^ sk[4 * i + 2]) + 256) % 256;
        x[3] = (tmp_x[4]) ^ (((f0(x[2])) + (sk[4 * i + 1])) % 256);
        x[5] = ((tmp_x[6]) - (f1(x[4]) ^ sk[4 * i]) + 256) % 256;
        x[7] = (tmp_x[0]) ^ (((f0(x[6])) + (sk[4 * i + 3])) % 256);
    }
}

function final_dec() {
    let X0 = [...x];
    let WK = wk.slice().reverse();
    x[0] = ((X0[0] - WK[0]) + 256) % 256;
    x[2] = (X0[2] ^ WK[1]);
    x[4] = ((X0[4] - WK[2]) + 256) % 256;
    x[6] = (X0[6] ^ WK[3]);
    x[1] = X0[1];
    x[3] = X0[3];
    x[5] = X0[5];
    x[7] = X0[7];
}

function main_dec() {
    generateMkWk();
    generateSD();
    generateSK();
    initial_dec();
    decryption();
    final_dec();
    /*let plaintext = "Plaintext: ";
    for (let i = 1; i <= 8; i++) {
        plaintext += (x[x.length - i]).toString(16).padStart(2, '0');
    }
    //console.log(plaintext);
    document.getElementById('decryptionResult').innerHTML = plaintext;*/
}

function start_dec(){
    //key="ffeeddccbbaa99887766554433221100";
    key = document.getElementById('decryptKey').value;
    key = key.replace(/\s/g, '');

    //let tmp_plainText = "00112233445566771111223344556677";
    let tmp_cipherText = document.getElementById('cipherText').value;
    tmp_cipherText = tmp_cipherText.replace(/\s/g, '');
    //plainText="0011223344556677"
    
    z=0;y=16;
    let plaintext = "";
    for(let i=1;i<(Math.floor(tmp_cipherText.length/16))+1;i++){
        cipherText=tmp_cipherText.substring(z,y);
        main_dec();
        z=z+16;
        y=y+16;
        for (let i = 1; i <= 8; i++) {
            plaintext = plaintext +""+ (x[x.length - i]).toString(16).padStart(2, '0');
        }
        
        //restoring global variables 
        mk = [];wk = [];
        s = [0, 1, 0, 1, 1, 0, 1];
        d = [];ct = [];
        sk = new Array(128).fill(0);
        x = new Array(8).fill(0);
        cipherText = "";
    }
    key = "";
    console.log(plaintext);
    plaintext=hexToAscii(plaintext);
    document.getElementById('decryptionResult').innerHTML = 'Plaintext: '+plaintext;    
}