interface GameEvent {
  type: string;
  data: unknown;
  time: number;
}

export class AntiCheat {
  private sessionId: string;
  private events: GameEvent[] = [];
  private secret = 'CLIENT_SECRET'; // TODO: Obfuscate in production

  constructor() {
    this.sessionId = crypto.randomUUID();
  }

  logEvent(type: string, data: unknown): void {
    this.events.push({
      type,
      data,
      time: Date.now()
    });
  }

  async generateChecksum(score: number, distance: number): Promise<string> {
    const payload = `${score}:${distance}:${this.sessionId}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const keyData = encoder.encode(this.secret);

    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, data);
    const hashArray = Array.from(new Uint8Array(signature));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async prepareSubmission(score: number, distance: number): Promise<{
    score: number;
    distance: number;
    sessionId: string;
    checksum: string;
    timestamp: number;
  }> {
    return {
      score,
      distance,
      sessionId: this.sessionId,
      checksum: await this.generateChecksum(score, distance),
      timestamp: Date.now()
    };
  }

  getSessionId(): string {
    return this.sessionId;
  }

  reset(): void {
    this.sessionId = crypto.randomUUID();
    this.events = [];
  }
}
