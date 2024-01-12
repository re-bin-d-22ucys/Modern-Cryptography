var Base64 = require('compact-base64')
function generateHash(message) {
  //let messageInput = document.getElementById("message").value;
  console.log("Message to be hashed" + message)
  let msg = Array(20).fill(0);
  let SI = Array(20).fill(0);
  let count = 0;
  let ol, u, l;
  let ht = Array.from({ length: 4096 }, () => Array(16).fill(0));
  let hash = Array(128).fill(0);
  let flag = 0;
  let m, confuse;
  let TI = Array(20).fill(0);
  let iv = 0;
  let z = Array(20).fill(0);

  let r1 = 0,
    r2 = 0,
    r3 = 0,
    r4 = 0,
    r5 = 0;

  let s = [
    1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0,
  ];

  // Convert message to bits
  let binaryMessage = [];
  for (let i = 0; i < message.length; i++) {
    let charCode = message.charCodeAt(i);
    let binaryString = charCode.toString(2).padStart(8, '0');
    binaryMessage = binaryMessage.concat(binaryString.split('').map(Number));
  }

  for (ol = 0; ol < 10; ol++) {
    //console.log("Round " + (ol + 1));
    let hr = 0;
    confuse = 0;
    count = 0;
    for (let j = 0; j < 4096; j++) {
      for (let i = 0; i < 20; i++) msg[i] = TI[i] ^ SI[i];

      change(s);

      for (let i = 136; i < 264; i++) hash[i - 136] = s[i];

      for (let i = 0; i < 20; i++) {
        let f1 =
          1 ^
          (s[0] * s[1] * s[9]) ^
          (s[0] * s[1] * s[114]) ^
          (s[0] * s[9] * s[94]) ^
          (s[0] * s[11]) ^
          (s[0] * s[94] * s[114]) ^
          (s[0] * s[94]) ^
          (s[1] * s[9] * s[94]) ^
          (s[1] * s[40]) ^
          (s[1] * s[94] * s[114]) ^
          (s[1] * s[114]) ^
          (s[9] * s[78]) ^
          (s[9] * s[94]) ^
          (s[9] * s[114]) ^
          (s[11] * s[94]) ^
          (s[40] * s[94]) ^
          (s[78] * s[114]);

        let f2 =
          1 ^
          (s[136] * s[137] * s[144]) ^
          (s[136] * s[137] * s[228]) ^
          (s[136] * s[144] * s[260]) ^
          (s[136] * s[177]) ^
          (s[136] * s[228] * s[260]) ^
          (s[136] * s[260]) ^
          (s[137] * s[144] * s[228]) ^
          (s[137] * s[179]) ^
          (s[144] * s[206]) ^
          (s[144] * s[228] * s[260]) ^
          (s[144] * s[260]) ^
          (s[177] * s[228]) ^
          (s[179] * s[260]) ^
          (s[206] * s[228]) ^
          s[228] ^
          s[260];

        let f = s[10] * s[49] ^ s[90] * s[188] ^ s[10] * s[276] ^ s[49] * s[208] ^ s[90] * s[276] ^ s[188] * s[208] ^ s[208] ^ s[276];

        z[i] = f ^ s[54] ^ s[171];
        for (let x = 0; x < 135; x++) s[x] = s[x + 1];
        s[135] = f1 ^ f;
        for (let x = 136; x < 279; x++) s[x] = s[x + 1];
        s[279] = f2 ^ f;

        for (let a = 0; a < 128; a++) {
          hash[a] = binaryMessage[i] * z[i] ^ binaryMessage[i] * hash[a] ^ z[i] * s[a] ^ hash[a] * s[a] ^ hash[a] ^ s[a];
        }
      }

      for (let i = 0; i < 16; i++) ht[j][i] = hash[i];

      u = 0;
      l = 12;
      binc(TI, u, l);
    }

    for (let m = 0; m < 4096; m++) {
      if (ht[m][0] !== 2) {
        for (let i = 0; i < 16; i++) hash[i] = ht[m][i];
      }
      for (let iv = m + 1; iv < 4096; iv++) {
        flag = 0;
        if (ht[iv] && ht[iv][0] !== 2) {
          for (let i = 0; i < 16; i++) {
            if (ht[iv][i] !== hash[i]) {
              flag = 1;
              break;
            }
          }
          if (flag === 0) {
            count++;
            ht[iv][0] = 2;
          }
        }
      }
    }

    for (let m = 0; m < 4096; m++) {
      if (ht[m][0] !== 2) confuse++;
    }

    for (let hr = 0; hr < 4096; hr++) {
      for (let i = 0; i < 16; i++) ht[hr][i] = 0;
    }

    //console.log("\nCount=" + count);

    if (0 <= count && count <= 116) r1++;
    else if (117 <= count && count <= 122) r2++;
    else if (123 <= count && count <= 128) r3++;
    else if (129 <= count && count <= 134) r4++;
    else if (135 <= count && count <= 4096) r5++;

    u = 0;
    l = 20;
    binc(SI, u, l);
  }

 // console.log("r1=" + r1 + ", r2=" + r2 + ", r3=" + r3 + ", r4=" + r4 + ", r5=" + r5);

  // Print the final hash value
  
  let hashBinaryString = hash.join('');
  console.log("Final Hash Value: " + hashBinaryString);
  
  let hashBase64 = Base64.encode(hashBinaryString);
  document.getElementById("hashedvalue").innerHTML = hashBase64;
  // Print the final encoded value
  //console.log("Final Encoded Value: " + 'h1' + hashBase64);
}

function binc(TI, u, l) {
  let c = l - 1;
  while (TI[c] === 1 && c >= u) {
    TI[c] = 0;
    c--;
  }
  if (TI[c] === 0) TI[c] = 1;
}

function change(s) {
  for (let i = 0; i < 280; i++) {
    let f1 =
      1 ^
      (s[0] * s[1] * s[9]) ^
      (s[0] * s[1] * s[114]) ^
      (s[0] * s[9] * s[94]) ^
      (s[0] * s[11]) ^
      (s[0] * s[94] * s[114]) ^
      (s[0] * s[94]) ^
      (s[1] * s[9] * s[94]) ^
      (s[1] * s[40]) ^
      (s[1] * s[94] * s[114]) ^
      (s[1] * s[114]) ^
      (s[9] * s[78]) ^
      (s[9] * s[94]) ^
      (s[9] * s[114]) ^
      (s[11] * s[94]) ^
      (s[40] * s[94]) ^
      (s[78] * s[114]);

    let f2 =
      1 ^
      (s[136] * s[137] * s[144]) ^
      (s[136] * s[137] * s[228]) ^
      (s[136] * s[144] * s[260]) ^
      (s[136] * s[177]) ^
      (s[136] * s[228] * s[260]) ^
      (s[136] * s[260]) ^
      (s[137] * s[144] * s[228]) ^
      (s[137] * s[179]) ^
      (s[144] * s[206]) ^
      (s[144] * s[228] * s[260]) ^
      (s[144] * s[260]) ^
      (s[177] * s[228]) ^
      (s[179] * s[260]) ^
      (s[206] * s[228]) ^
      s[228] ^
      s[260];

    let f = s[10] * s[49] ^ s[90] * s[188] ^ s[10] * s[276] ^ s[49] * s[208] ^ s[90] * s[276] ^ s[188] * s[208] ^ s[208] ^ s[276];

    for (let x = 0; x < 135; x++) s[x] = s[x + 1];
    s[135] = f1 ^ f;

    for (let x = 136; x < 279; x++) s[x] = s[x + 1];
    s[279] = f2 ^ f;
  }
}
