import { useState, useCallback } from 'react';
import { Play, Lock, Key, Shield, FileCheck, Link2 } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import {
  hash,
  deriveKey,
  CryptographicBackend,
} from '@aleph-ai/tinyaleph';

// Example 1: Secure Password Hashing
const PasswordHashExample = () => {
  const [password, setPassword] = useState('mySecretPassword123');
  const [storedHash, setStoredHash] = useState<string | null>(null);
  const [verifyPassword, setVerifyPassword] = useState('');
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);

  const hashPassword = useCallback(() => {
    const h = hash(password, 32);
    setStoredHash(h);
    setVerifyResult(null);
  }, [password]);

  const verify = useCallback(() => {
    if (!storedHash) return;
    const attemptHash = hash(verifyPassword, 32);
    setVerifyResult(attemptHash === storedHash);
  }, [verifyPassword, storedHash]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Secure Password Hashing</h3>
            <p className="text-sm text-muted-foreground">Hash and verify passwords safely</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Password to Hash</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
                placeholder="Enter password..."
              />
              <button
                onClick={hashPassword}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Lock className="w-4 h-4" /> Hash
              </button>
            </div>
          </div>

          {storedHash && (
            <>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Stored Hash</p>
                <code className="text-sm font-mono text-primary break-all">{storedHash}</code>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Verify Password</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={verifyPassword}
                    onChange={(e) => setVerifyPassword(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
                    placeholder="Enter password to verify..."
                  />
                  <button
                    onClick={verify}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-primary/20 transition-colors"
                  >
                    <Shield className="w-4 h-4" /> Verify
                  </button>
                </div>
              </div>

              {verifyResult !== null && (
                <div className={`p-4 rounded-lg ${verifyResult ? 'bg-primary/20 border-primary/30' : 'bg-destructive/20 border-destructive/30'} border`}>
                  <p className="font-semibold flex items-center gap-2">
                    {verifyResult ? '✓ Password matches!' : '✗ Password does not match'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <CodeBlock
        code={`import { hash } from '@aleph-ai/tinyaleph';

// Hash a password
function hashPassword(password) {
  return hash(password, 32); // 32-dimensional hash
}

// Verify password
function verifyPassword(password, storedHash) {
  const attemptHash = hash(password, 32);
  return attemptHash === storedHash;
}

// Usage
const stored = hashPassword('mySecret');
console.log('Valid:', verifyPassword('mySecret', stored));   // true
console.log('Invalid:', verifyPassword('wrongPass', stored)); // false`}
        language="javascript"
        title="crypto/01-password-hash.js"
      />
    </div>
  );
};

// Example 2: Key Derivation
const KeyDerivationExample = () => {
  const [passphrase, setPassphrase] = useState('correct horse battery staple');
  const [salt, setSalt] = useState('unique-user-salt-123');
  const [iterations, setIterations] = useState(10000);
  const [derivedKey, setDerivedKey] = useState<string | null>(null);

  const derive = useCallback(() => {
    try {
      const key = deriveKey(passphrase, salt, 32, iterations);
      setDerivedKey(typeof key === 'string' ? key : JSON.stringify(key));
    } catch (e) {
      console.error(e);
    }
  }, [passphrase, salt, iterations]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Key className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Key Derivation</h3>
            <p className="text-sm text-muted-foreground">PBKDF-like key stretching for security</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Passphrase</label>
            <input
              type="text"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Salt</label>
            <input
              type="text"
              value={salt}
              onChange={(e) => setSalt(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
            />
          </div>
        </div>

        <div className="flex gap-4 items-end mb-4">
          <div className="flex-1">
            <label className="text-sm text-muted-foreground mb-1 block">Iterations: {iterations.toLocaleString()}</label>
            <input
              type="range"
              min="1000"
              max="100000"
              step="1000"
              value={iterations}
              onChange={(e) => setIterations(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <button
            onClick={derive}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Key className="w-4 h-4" /> Derive
          </button>
        </div>

        {derivedKey && (
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Derived Key (32D)</p>
            <code className="text-sm font-mono text-primary break-all">{derivedKey}</code>
          </div>
        )}
      </div>

      <CodeBlock
        code={`import { deriveKey } from '@aleph-ai/tinyaleph';

// Derive a secure key from a passphrase
const key = deriveKey(
  '${passphrase}',     // passphrase
  '${salt}',                   // unique salt
  32,                          // dimension
  ${iterations}                // iterations
);

// Different salts → different keys
const key1 = deriveKey('password', 'user1-salt', 32, 10000);
const key2 = deriveKey('password', 'user2-salt', 32, 10000);
// key1 !== key2`}
        language="javascript"
        title="crypto/02-key-derivation.js"
      />
    </div>
  );
};

// Example 3: Message Authentication (HMAC-like)
const HMACExample = () => {
  const [message, setMessage] = useState('Transfer $1000 to Alice');
  const [secretKey, setSecretKey] = useState('my-secret-key');
  const [signature, setSignature] = useState<string | null>(null);
  const [verifyMessage, setVerifyMessage] = useState('');
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);

  const sign = useCallback(() => {
    // HMAC = hash(key || message)
    const sig = hash(secretKey + '||' + message, 32);
    setSignature(sig);
    setVerifyResult(null);
  }, [message, secretKey]);

  const verify = useCallback(() => {
    if (!signature) return;
    const expectedSig = hash(secretKey + '||' + verifyMessage, 32);
    setVerifyResult(expectedSig === signature);
  }, [verifyMessage, secretKey, signature]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Message Authentication</h3>
            <p className="text-sm text-muted-foreground">Sign and verify messages with HMAC-like scheme</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Message</label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Secret Key</label>
            <input
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
            />
          </div>
        </div>

        <button
          onClick={sign}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mb-4"
        >
          <Shield className="w-4 h-4" /> Sign Message
        </button>

        {signature && (
          <>
            <div className="p-4 rounded-lg bg-muted/50 mb-4">
              <p className="text-xs text-muted-foreground mb-1">Signature</p>
              <code className="text-sm font-mono text-primary break-all">{signature}</code>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={verifyMessage}
                onChange={(e) => setVerifyMessage(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
                placeholder="Enter message to verify..."
              />
              <button
                onClick={verify}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-primary/20 transition-colors"
              >
                <FileCheck className="w-4 h-4" /> Verify
              </button>
            </div>

            {verifyResult !== null && (
              <div className={`mt-4 p-4 rounded-lg ${verifyResult ? 'bg-primary/20' : 'bg-destructive/20'}`}>
                {verifyResult ? '✓ Signature valid - message is authentic' : '✗ Signature invalid - message was tampered'}
              </div>
            )}
          </>
        )}
      </div>

      <CodeBlock
        code={`import { hash } from '@aleph-ai/tinyaleph';

// HMAC-like message authentication
function sign(message, key) {
  return hash(key + '||' + message, 32);
}

function verify(message, signature, key) {
  const expectedSig = sign(message, key);
  return expectedSig === signature;
}

// Sign a message
const sig = sign('Transfer $1000 to Alice', 'secret-key');

// Verify
console.log(verify('Transfer $1000 to Alice', sig, 'secret-key'));  // true
console.log(verify('Transfer $9999 to Alice', sig, 'secret-key'));  // false`}
        language="javascript"
        title="crypto/03-hmac.js"
      />
    </div>
  );
};

// Example 4: Commitment Scheme
const CommitmentExample = () => {
  const [secret, setSecret] = useState('my secret vote');
  const [nonce, setNonce] = useState(() => Math.random().toString(36).substring(7));
  const [commitment, setCommitment] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const commit = useCallback(() => {
    const c = hash(secret + '||' + nonce, 32);
    setCommitment(c);
    setRevealed(false);
  }, [secret, nonce]);

  const reveal = useCallback(() => {
    setRevealed(true);
  }, []);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <FileCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Commitment Scheme</h3>
            <p className="text-sm text-muted-foreground">Commit-reveal protocol for secure voting/auctions</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Secret Value</label>
            <input
              type={revealed ? 'text' : 'password'}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
              disabled={!!commitment}
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Random Nonce</label>
            <input
              type="text"
              value={nonce}
              onChange={(e) => setNonce(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground font-mono text-sm"
              disabled={!!commitment}
            />
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={commit}
            disabled={!!commitment}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Lock className="w-4 h-4" /> Commit
          </button>
          {commitment && (
            <button
              onClick={reveal}
              disabled={revealed}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              <Key className="w-4 h-4" /> Reveal
            </button>
          )}
          {commitment && (
            <button
              onClick={() => { setCommitment(null); setRevealed(false); setNonce(Math.random().toString(36).substring(7)); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        {commitment && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Commitment (public)</p>
              <code className="text-sm font-mono text-primary break-all">{commitment}</code>
            </div>
            
            {revealed && (
              <div className="p-4 rounded-lg bg-primary/20 border border-primary/30">
                <p className="text-sm text-muted-foreground mb-2">Revealed:</p>
                <p className="font-mono">Secret: <span className="text-primary">{secret}</span></p>
                <p className="font-mono">Nonce: <span className="text-primary">{nonce}</span></p>
                <p className="text-sm text-muted-foreground mt-2">
                  Anyone can verify: hash("{secret}||{nonce}") = commitment ✓
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <CodeBlock
        code={`import { hash } from '@aleph-ai/tinyaleph';

// Commitment scheme
function commit(value, nonce) {
  return hash(value + '||' + nonce, 32);
}

function reveal(commitment, value, nonce) {
  const expected = commit(value, nonce);
  return expected === commitment;
}

// Phase 1: Commit
const nonce = crypto.randomBytes(16).toString('hex');
const commitment = commit('my vote', nonce);
// Publish commitment publicly

// Phase 2: Reveal
console.log(reveal(commitment, 'my vote', nonce));  // true
console.log(reveal(commitment, 'other', nonce));    // false`}
        language="javascript"
        title="crypto/04-commitment.js"
      />
    </div>
  );
};

// Example 5: Content Addressing
const ContentHashExample = () => {
  const [content, setContent] = useState('Hello, this is my content');
  const [contentHash, setContentHash] = useState<string | null>(null);
  const [storage, setStorage] = useState<Map<string, string>>(new Map());

  const store = useCallback(() => {
    const h = hash(content, 32);
    setContentHash(h);
    setStorage(prev => new Map(prev).set(h, content));
  }, [content]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Link2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Content Addressing</h3>
            <p className="text-sm text-muted-foreground">Content-addressable storage like IPFS</p>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="text-sm text-muted-foreground mb-1 block">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground h-24"
          />
        </div>

        <button
          onClick={store}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mb-4"
        >
          <Link2 className="w-4 h-4" /> Store (get CID)
        </button>

        {contentHash && (
          <div className="p-4 rounded-lg bg-muted/50 mb-4">
            <p className="text-xs text-muted-foreground mb-1">Content ID (CID)</p>
            <code className="text-sm font-mono text-primary break-all">{contentHash}</code>
            <p className="text-xs text-muted-foreground mt-2">
              Same content always produces the same CID (deduplication)
            </p>
          </div>
        )}

        {storage.size > 0 && (
          <div className="p-4 rounded-lg bg-muted/30">
            <p className="text-sm font-semibold mb-2">Stored Content ({storage.size} items)</p>
            {Array.from(storage.entries()).map(([cid, data]) => (
              <div key={cid} className="text-xs font-mono py-1 border-b border-border last:border-0">
                <span className="text-primary">{cid.substring(0, 16)}...</span>
                <span className="text-muted-foreground"> → {data.substring(0, 30)}...</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <CodeBlock
        code={`import { hash } from '@aleph-ai/tinyaleph';

// Content-addressable storage
class ContentStore {
  constructor() {
    this.storage = new Map();
  }
  
  // Store content, return content ID
  store(content) {
    const cid = hash(content, 32);
    this.storage.set(cid, content);
    return cid;
  }
  
  // Retrieve by CID
  retrieve(cid) {
    return this.storage.get(cid);
  }
  
  // Check if content exists
  has(content) {
    const cid = hash(content, 32);
    return this.storage.has(cid);
  }
}

const store = new ContentStore();
const cid = store.store('Hello World');
console.log('CID:', cid);
console.log('Content:', store.retrieve(cid));`}
        language="javascript"
        title="crypto/05-content-hash.js"
      />
    </div>
  );
};

const CryptoExamplesPage = () => {
  return (
    <div className="pt-20">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mt-4 mb-2">Cryptographic Examples</h1>
          <p className="text-muted-foreground">
            Security-focused applications using semantic hashing and hypercomplex cryptography.
          </p>
        </div>

        <div className="space-y-12">
          <PasswordHashExample />
          <KeyDerivationExample />
          <HMACExample />
          <CommitmentExample />
          <ContentHashExample />
        </div>
      </div>
    </div>
  );
};

export default CryptoExamplesPage;
