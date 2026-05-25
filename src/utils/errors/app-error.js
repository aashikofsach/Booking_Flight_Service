class AppError extends Error {
  constructor(message, statusCode, type = "GENERAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.explaination = message;
    this.type = type;  // ← Add error type
  }
}

module.exports = AppError;
