export class GoogleSignInSetupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GoogleSignInSetupError';
  }
}
