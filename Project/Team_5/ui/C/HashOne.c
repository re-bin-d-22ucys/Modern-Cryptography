//This code prints the Binary Hash Value
#include<stdio.h>
#include<stdlib.h>
#include <stdint.h>
#include <string.h>

#define SPONGE_STATE_SIZE 161
#define MESSAGE_SIZE 512
#define P_SIZE 80
#define Q_SIZE 81

void spongeConstruction(int* state, const int* message, int k);
void updateFunction(int* state, int round);

int main() {
    int state[SPONGE_STATE_SIZE] = {1,0,1,0,1,0,1,0,0,1,1,0,1,1,0,1,0,1,0,1,0,1,1,1,0,1,0,0,1,1,0,1,1,1,0,1,1,0,0,1,0,1,0,0,1,0,1,0,1,0,0,1,1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,0,1,0,0,1,0,1,0,0,1,0,1,0,1,1,0,1,1,0,1,0,0,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1,1,0,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,1,0,1,1,0,1,1,0,1,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1}; // Initialize sponge state

    char filename;
    printf("Enter the filename to be hashed:");
    scanf("%s",&filename);
    FILE *file = fopen(filename, "rb");
    if (!file) {
        perror("Error opening file");
        return 1;
    }

    int message[MESSAGE_SIZE];
    memset(message, 0, sizeof(message));

    // Read file content
    size_t bytesRead = fread(message, 1, sizeof(message), file);
    fclose(file);

    if (bytesRead <= 0) {
        perror("Error reading file");
        return 1;
    }

    int k = bytesRead * 8;  // Set message size (bits)

    spongeConstruction(state, message, k);

    return 0;
}

void spongeConstruction(int* state, const int* message, int k) {
    int l = 0;

    while (l < k) {
        if (l == 0) {
            state[160] ^= message[l];
            updateFunction(state, 324);
            l++;
        }
        else if(l==1) {
            for (int i = 1; i <= k - 2; i++) {
                state[160] ^= message[l];
                updateFunction(state, 162);
                l++;
            }
        }

        else if (l == k - 1) {
                state[160] ^= message[l];
                updateFunction(state, 324);
                l++;
            }
    }

    // Squeezing phase
    int hash[160] = {0};
    hash[1]=state[160];
    printf("Hash Value: %d",hash[1]&1);
    for (int i = 2; i < 160; i++) {
        updateFunction(state, 1);
        printf("%d", state[160] & 1);
    }
}

void updateFunction(int* state, int round) {
    // Implement the update function based on the provided details
    int P[P_SIZE];
    int Q[Q_SIZE];
    int Pf;
    int Qf;
    int Lf;
    for (int i = 0; i < P_SIZE; i++) {
        P[i] = state[i];
    }
    for (int i = P_SIZE; i < SPONGE_STATE_SIZE; i++) {
        Q[i - P_SIZE] = state[i];
    }
    for (int r = 0; r < round; r++) {
        // Implement the non-linear functions Pf and Qf
        Pf = (P[0]*P[11]^P[0]*P[55]^P[11]*P[23]^Q[23]*P[55]^Q[23]*P[55])^1;
        Qf = (Q[25]*P[48]^Q[25]*Q[41]^Q[0]*P[48]^Q[0]*Q[41]^Q[25]^Q[41])^1;
        Lf = (P[1]*Q[1]*P[50]);
        //Left Shift One bit at a time
        for(int i=0 ; i<P_SIZE;i++){
            P[i]+=P[i+1];
        }
        for(int i=0; i<Q_SIZE;i++){
            Q[i]=Q[i+1];
        }
        //The last index values are updated after shifting
        P[79]=Lf^Pf;
        Q[80]=Qf^Lf;
    }
    // Combine P and Q to update the state
    for (int i = 0; i < P_SIZE; i++) {
        state[i] = P[i];
    }
    for (int i = P_SIZE; i < SPONGE_STATE_SIZE; i++) {
        state[i] = Q[i - P_SIZE];
    }
}
