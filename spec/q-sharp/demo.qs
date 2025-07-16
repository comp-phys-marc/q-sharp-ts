operation GroverDiffusion(): Unit {
    use a = Qubit();
    use b = Qubit();
    H(a);
    H(b);
    Z(a);
    Z(b);
    Controlled Z(a, b);
    H(a);
    H(b);
}

operation Main(): Unit {
    use register = Qubit[2];
    
    // prepare equal superposition
    for q in register {
        H(q);
    }

    // collapse superposition
    for q in register {
        H(q);
    }

    // create entanglement
    H(register[0]);
    CNOT(register[0], register[1]);

    // perform Bell measurement
    CNOT(register[0], register[1]);
    H(register[0]);

    // Reset
    ResetAll(register);

    // Single qubit rotations
    Rx(3.2, register[0]);
    Ry(3.3, register[1]);
    Rz(3.4, register[0]);

    // Ising XX 
    Rxx(1.5, register[0], register[1]);

    // Ising XX
    Rxx(2.3, register[0], register[1]);

    // Ising ZZ
    Rzz(8.5, register[0], register[1]);

    // SWAP
    SWAP(register[1], register[0]);
}
