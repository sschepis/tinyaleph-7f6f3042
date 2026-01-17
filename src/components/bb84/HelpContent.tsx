import { Lock, Send, Key, Shield, Zap } from 'lucide-react';
import { HelpStep } from '@/components/app-help/AppHelpDialog';

export function HelpContent(): HelpStep[] {
  return [
    {
      title: "What is BB84?",
      icon: Lock,
      content: `BB84 is the first quantum key distribution (QKD) protocol, invented by Charles Bennett and Gilles Brassard in 1984.

It allows two parties (Alice and Bob) to establish a shared secret key with **information-theoretic security**—meaning its security is guaranteed by the laws of physics, not computational complexity.

The key insight: Any eavesdropper (Eve) who tries to intercept the quantum transmission will inevitably disturb the quantum states, revealing her presence.`
    },
    {
      title: "How It Works",
      icon: Send,
      content: `**Step 1: Quantum Transmission**
Alice encodes random bits using randomly chosen polarization bases:
• Rectilinear (+): 0 = horizontal, 1 = vertical
• Diagonal (×): 0 = 45°, 1 = 135°

**Step 2: Measurement**
Bob measures each photon using a randomly chosen basis. If he picks the same basis as Alice, he gets the correct bit. Otherwise, it's random.

**Step 3: Basis Reconciliation**
Over a public channel, Alice and Bob compare which bases they used (not the bits!). They keep only the bits where their bases matched.

**Step 4: Error Checking**
They sacrifice some bits to estimate the error rate. Too high = eavesdropper detected!`
    },
    {
      title: "Why Eve Can't Win",
      icon: Shield,
      content: `Eve faces an impossible dilemma:

1. **She must measure** to learn the bit values
2. **She can't know the basis** Alice used
3. **Wrong basis = random result** (50% error chance)
4. **She must re-send** a photon to avoid detection
5. **But she might have flipped the bit!**

When Eve intercepts at rate p, she introduces errors at rate ~p/4 in the final key. If Alice and Bob see error rates above ~11%, they know to abort.

This is **unconditional security**—it doesn't depend on any computational assumptions!`
    },
    {
      title: "The Math",
      icon: Key,
      content: `**Error Introduction by Eve:**
• Eve intercepts with probability p
• She chooses wrong basis with probability 0.5
• When wrong, she gets random bit (50% wrong)
• If Bob uses Alice's basis, Eve's wrong bit causes error
• Expected error rate: p × 0.5 × 0.5 = p/4

**Security Threshold:**
For BB84, if error rate > 11%, secure key extraction becomes impossible.`
    },
    {
      title: "Try It!",
      icon: Zap,
      content: `**Experiments to run:**

1. **Secure Key Exchange** - Run with Eve disabled. See perfect key agreement!

2. **Eavesdropper Detection** - Enable Eve at 100% interception. Watch the error rate spike above 11%.

3. **Partial Interception** - Try different Eve interception rates. See how even low rates are detectable.

The beautiful thing: Alice and Bob can detect Eve even though she's trying to be stealthy!`
    }
  ];
}
