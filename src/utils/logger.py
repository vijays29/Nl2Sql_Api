import logging

def get_logger(name: str) -> logging.Logger:
    """
    Configures and returns a logger with the specified name.

    This function sets up a logger that writes log messages to the console with a specific format.
    If the logger has no existing handlers, it configures a new stream handler, sets the log level to
    `INFO`, and applies a log message format that includes the timestamp, log level, and message content.

    Args:
        name (str): The name of the logger. This can be used to differentiate between loggers 
                    in different parts of the application.

    Returns:
        logging.Logger: A logger instance configured with a stream handler, log level, and format.

    Example:
        logger = get_logger("MyAppLogger")
        logger.info("This is an info message")
    """
    # Create or retrieve the logger with the specified name
    logger = logging.getLogger(name)
    
    # Check if the logger already has handlers, to avoid adding duplicate handlers
    if not logger.hasHandlers():
        # Create a stream handler to output logs to the console
        handler = logging.StreamHandler()
        
        # Define a formatter that includes timestamp, log level, and log message
        formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
        
        # Set the formatter to the handler
        handler.setFormatter(formatter)
        
        # Add the handler to the logger
        logger.addHandler(handler)
        
        # Set the log level of the logger. Default is INFO to capture standard operational messages.
        logger.setLevel(logging.INFO)
    
    # Return the configured logger
    return logger
