const OK_STATUS = 'success';

export function success(message?: string | object) {
  if (!message) {
    return { status: OK_STATUS };
  } else if (typeof message === 'object') {
    return {
      payload: message,
      status: OK_STATUS
    };
  } else if (typeof message === 'string') {
    return {
      message,
      status: OK_STATUS
    };
  } else {
    throw new Error('Unexpected success payload');
  }
}
