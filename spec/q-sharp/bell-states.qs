/// # Sample
/// Bell States
///
/// # Description
/// Bell states or EPR pairs are specific quantum states of two qubits
/// that represent the simplest (and maximal) examples of quantum entanglement.
///
/// This Q# program implements the four different Bell states.

import Std.Diagnostics.*;
import Std.Measurement.*;

operation Main() : Result[] {
    // Allocate the two qubits that will be used to create a Bell state.
    use register = Qubit[2];

    // This array contains a label and a preparation operation for each one
    // of the four Bell states.
    let bellStateTuples = [PreparePhiPlus, PreparePhiMinus, PreparePsiPlus, PreparePsiMinus];

    // Prepare all Bell states, show them using the `DumpMachine` operation
    // and measure the Bell state qubits.
    for prepare in bellStateTuples {
        prepare(register);
        DumpMachine();
    }

    return [MResetZ(register[0]), MResetZ(register[1])];
}

operation PreparePhiPlus(register : Qubit[]) : Unit {
    ResetAll(register);             // |00〉
    H(register[0]);                 // |+0〉
    CNOT(register[0], register[1]); // 1/sqrt(2)(|00〉 + |11〉)
}

operation PreparePhiMinus(register : Qubit[]) : Unit {
    ResetAll(register);             // |00〉
    H(register[0]);                 // |+0〉
    Z(register[0]);                 // |-0〉
    CNOT(register[0], register[1]); // 1/sqrt(2)(|00〉 - |11〉)
}

operation PreparePsiPlus(register : Qubit[]) : Unit {
    ResetAll(register);             // |00〉
    H(register[0]);                 // |+0〉
    X(register[1]);                 // |+1〉
    CNOT(register[0], register[1]); // 1/sqrt(2)(|01〉 + |10〉)
}

operation PreparePsiMinus(register : Qubit[]) : Unit {
    ResetAll(register);             // |00〉
    H(register[0]);                 // |+0〉
    Z(register[0]);                 // |-0〉
    X(register[1]);                 // |-1〉
    CNOT(register[0], register[1]); // 1/sqrt(2)(|01〉 - |10〉)
}