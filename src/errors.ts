/** Class representing a bad argument exception. */
class BadArgumentError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = BadArgumentError.name;
    }
}

/** Class representing a mixed types exception. */
class MixedTypesError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = MixedTypesError.name;
    }
}

/** Class representing an unsupported type exception. */
class UnsupportedTypeError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = UnsupportedTypeError.name;
    }
}

/** Class representing a bad parameter exception. */
class BadParameterError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = BadParameterError.name;
    }
}

/** Class representing a bad gate applicaiton exception. */
class BadGateApplicationError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = BadGateApplicationError.name;
    }
}

/** Class representing a bad use exception. */
class BadUseError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = BadUseError.name;
    }
}

/** Class representing a bad struct exception. */
class BadStructError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = BadStructError.name;
    }
}

/** Class representing a bad Function exception. */
class BadFunctionError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = BadFunctionError.name;
    }
}

/** Class representing a bad Conjugation exception. */
class BadConjugationError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = BadConjugationError.name;
    }
}

/** Class representing a bad Function name exception. */
class BadFunctionNameError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = BadFunctionNameError.name;
    }
}

/** Class representing a bad Operation name exception. */
class BadOperationNameError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = BadOperationNameError.name;
    }
}

/** Class representing a bad Function usage exception. */
class BadUseFunctionError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = BadUseFunctionError.name;
    }
}

/** Class representing an uninitialized Function exception. */
class UninitializedInstanceError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = UninitializedInstanceError.name;
    }
}

/** Class representing an uninitialized variable exception. */
class UninitializedVariableError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = UninitializedVariableError.name;
    }
}

/** Class representing a wrong quote exception. */
class WrongQuoteError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = WrongQuoteError.name;
    }
}

/** Class representing a bad array exception. */
class BadArrayError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = BadArrayError.name;
    }
}

/** Class representing a bad register index exception. */
class BadIndexError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = BadIndexError.name;
    }
}

/** Class representing a bad declaration exception. */
class BadDeclarationError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = BadDeclarationError.name;
    }
}

/** Class representing a bad integer exception. */
class BadIntError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = BadIntError.name;
    }
}

/** Class representing a bad chain exception. */
class BadChainError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = BadChainError.name;
    }
}

/** Class representing a bad binding exception. */
class BadBindingError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = BadBindingError.name;
    }
}

/** Class representing a bad pin exception. */
class BadPinError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = BadPinError.name;
    }
}

/** Class representing a bad import exception. */
class BadImportError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = BadImportError.name;
    }
}

/** Class representing a bad equivalence exception. */
class BadEquivalenceError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = BadEquivalenceError.name;
    }
}

/** Class representing a bad format exception. */
class BadFormatError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = BadFormatError.name;
    }
}

/** Class representing a bad identifier exception. */
class BadIdentifierError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = BadIdentifierError.name;
    }
}

/** Class representing a bad loop exception. */
class BadLoopError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = BadLoopError.name;
    }
}

/** Class representing a bad iterator exception. */
class BadIteratorError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = BadIteratorError.name;
    }
}

/** Class representing a bad condition structure exception. */
class BadConditionStructureError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = BadConditionStructureError.name;
    }
}

/** Class representing an undeclared variable exception. */
class UndeclaredVariableError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = UndeclaredVariableError.name;
    }
}

/** Class representing an undeclared qubit exception. */
class UndeclaredQubitError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = UndeclaredQubitError.name;
    }
}

export {
    BadArgumentError,
    BadParameterError,
    BadBindingError,
    WrongQuoteError,
    BadFunctionError,
    BadFunctionNameError,
    BadOperationNameError,
    BadConjugationError,
    BadIteratorError,
    BadIntError,
    BadArrayError,
    BadLoopError,
    BadConditionStructureError,
    BadIndexError,
    BadUseFunctionError,
    UndeclaredQubitError,
    UndeclaredVariableError,
    BadDeclarationError,
    BadChainError,
    BadPinError,
    BadEquivalenceError,
    BadImportError,
    BadFormatError,
    BadIdentifierError,
    UninitializedInstanceError,
    MixedTypesError,
    UninitializedVariableError,
    UnsupportedTypeError,
    BadStructError,
    BadUseError,
    BadGateApplicationError
};