const SPONGE_STATE_SIZE = 161;
const MESSAGE_SIZE = 512;
const P_SIZE = 80;
const Q_SIZE = 81;

function calculateHash() {
    const fileInput = document.getElementById('fileInput');
    const hashedValue = document.getElementById('hashedvalue');

    const file = fileInput.files[0];
    if (!file) {
        alert('Please choose a file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const fileContent = new Uint8Array(e.target.result);
        const message = new Array(MESSAGE_SIZE).fill(0);

        for (let i = 0; i < fileContent.length && i < MESSAGE_SIZE; i++) {
            message[i] = fileContent[i];
        }

        // Assign the state bit array
        const state = [
            1,0,1,0,1,0,1,0,0,1,1,0,1,1,0,1,0,1,0,1,0,1,1,1,0,1,0,0,1,1,0,1,1,1,0,1,1,0,0,1,0,1,0,0,1,0,1,0,1,0,0,1,1,0,1,1,1,
            0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,0,1,0,0,1,0,1,0,0,1,0,1,0,1,1,0,1,1,0,1,0,0,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1,1,0,
            1,1,0,1,1,0,1,1,1,0,1,1,0,1,1,0,1,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1
        ];

        spongeConstruction(state, message, fileContent.length * 8);

        let hashValue = '';
        for (let i = 0; i < SPONGE_STATE_SIZE; i++) {
            hashValue += state[i].toString(16).padStart(2, '0');
        }

        // Display hash as hexadecimal
        hashedValue.innerHTML = 'Hash Value: 0x' + hashValue;
    };

    reader.readAsArrayBuffer(file);
}

function verifyHash() {
    // Add verification logic here if needed
}

function spongeConstruction(state, message, k) {
    let l = 0;

    while (l < k) {
        if (l === 0) {
            state[160] ^= message[l];
            updateFunction(state, 324);
            l++;
        } else if (l === 1) {
            for (let i = 1; i <= k - 2; i++) {
                state[160] ^= message[l];
                updateFunction(state, 162);
                l++;
            }
        } else if (l === k - 1) {
            state[160] ^= message[l];
            updateFunction(state, 324);
            l++;
        }
    }
}

function updateFunction(state, round) {
    let P = state.slice(0, P_SIZE);
    let Q = state.slice(P_SIZE, SPONGE_STATE_SIZE);
    let Pf;
    let Qf;
    let Lf;

    for (let r = 0; r < round; r++) {
        Pf = (P[0] * P[11] ^ P[0] * P[55] ^ P[11] * P[23] ^ Q[23] * P[55] ^ Q[23] * P[55]) ^ 1;
        Qf = (Q[25] * P[48] ^ Q[25] * Q[41] ^ Q[0] * P[48] ^ Q[0] * Q[41] ^ Q[25] ^ Q[41]) ^ 1;
        Lf = (P[1] * Q[1] * P[50]);

        for (let i = 0; i < P_SIZE - 1; i++) {
            P[i] += P[i + 1];
        }
        for (let i = 0; i < Q_SIZE - 1; i++) {
            Q[i] = Q[i + 1];
        }

        P[79] = Lf ^ Pf;
        Q[80] = Qf ^ Lf;
    }

    for (let i = 0; i < P_SIZE; i++) {
        state[i] = P[i];
    }
    for (let i = P_SIZE; i < SPONGE_STATE_SIZE; i++) {
        state[i] = Q[i - P_SIZE];
    }
}