document.getElementById('generateBtn').addEventListener('click', generateSignature);

function generateSignature() {
  const privateKeyHex = document.getElementById('privateKey').value;
  const message = document.getElementById('message').value;

  // Validate input
  if (!privateKeyHex || !message) {
    alert('Please enter both private key and message.');
    return;
  }

  try {
    // Convert the private key from hex to bytes
    const privateKeyBytes = hexToBytes(privateKeyHex);

    // Create an elliptic curve object using the secp256k1 curve
    const ec = new elliptic.ec('secp256k1');

    // Create a key pair from the private key
    const key = ec.keyFromPrivate(privateKeyBytes);

    // Hash the message using SHA-256
    const hashedMessage = CryptoJS.SHA256(CryptoJS.enc.Utf8.parse(message)).toString(CryptoJS.enc.Hex);

    // Sign the hashed message
    const signature = key.sign(hashedMessage);

     /* Modify the signature to make it invalid (for example, increment s)
     signature.s = signature.s.add(ec.n); // This is just an example, you can modify it differently*/

    // Display the signature in hex format
    const signatureOutput = `(${signature.r.toString(16)}, ${signature.s.toString(16)})`;
    document.getElementById('signatureOutput').innerText = signatureOutput;

    // Verification logic
    const validSignature = key.verify(hashedMessage, signature);

    // Display the verification result
    const verificationOutput = `Is Signature valid? : ${validSignature}`;
    document.getElementById('verificationOutput').innerText = verificationOutput;
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

// Hex to Bytes conversion
function hexToBytes(hex) {
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return new Uint8Array(bytes);
}