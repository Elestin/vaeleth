import React, { useState } from 'react';
import { Crown } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useAppStore } from '@/store';
import { createDeity } from '@/services/database';
import { Domain } from '@/types';

const DOMAINS: Domain[] = [
  'Death', 'Water', 'Fire', 'War', 'Sun', 'Love', 'Moon',
  'Nature', 'Harvest', 'Storm', 'Knowledge', 'Fertility',
  'Luck', 'Music', 'Justice', 'Healing', 'Dreams',
  'Chaos', 'Forge', 'Magic', 'Travel'
];

const DOMAIN_DESCRIPTIONS: Record<Domain, string> = {
  Death: 'Command over the cycle of life and death, guiding souls to the afterlife',
  Water: 'Master of oceans, rivers, and all flowing waters of the world',
  Fire: 'Wielder of flame and forge, bringing warmth and destruction',
  War: 'Lord of battle and strategy, inspiring courage in warriors',
  Sun: 'Bringer of light and life, banishing darkness from the world',
  Love: 'Weaver of hearts and bonds, uniting souls across the realms',
  Moon: 'Guardian of the night, dreams, and hidden mysteries',
  Nature: 'Protector of forests, animals, and the wild places',
  Harvest: 'Provider of abundance, ensuring bountiful crops and prosperity',
  Storm: 'Master of thunder and lightning, controller of tempests',
  Knowledge: 'Keeper of wisdom and learning, illuminating minds with truth',
  Fertility: 'Blessing of growth and new life in all its forms',
  Luck: 'Spinner of fortune and chance, changing fates with a thought',
  Music: 'Creator of harmony and song, inspiring joy through melody',
  Justice: 'Upholder of law and order, ensuring balance in all things',
  Healing: 'Mender of wounds and ailments, bringing restoration to the suffering',
  Dreams: 'Walker between sleeping minds, shaping visions and nightmares',
  Chaos: 'Agent of change and unpredictability, breaking stagnant order',
  Forge: 'Divine craftsman, creating wonders through skill and flame',
  Magic: 'Weaver of arcane forces, master of supernatural energies',
  Travel: 'Guide of journeys and paths, connecting distant lands'
};

const DeityCreator: React.FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [deityName, setDeityName] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<Domain>('Death');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { currentUser, setDeity, setError, getNextAvailableTab, setCurrentTab } = useAppStore();
  
  const domainOptions = DOMAINS.map(domain => ({
    value: domain,
    label: domain
  }));
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to create a deity');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const deity = {
        name: deityName.trim(),
        playerName: playerName.trim(),
        domain: selectedDomain
      };
      
      await createDeity(currentUser.uid, deity);
      
      // Update local state
      setDeity({
        ...deity,
        userId: currentUser.uid,
        createdAt: Date.now()
      });
      
      // Navigate to next step
      const nextTab = getNextAvailableTab();
      setCurrentTab(nextTab);
      
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto bg-fantasy-blue/90 backdrop-blur-sm rounded-lg shadow-xl p-8 border border-fantasy-purple/50">
      <div className="text-center mb-8">
        <Crown className="mx-auto text-fantasy-gold mb-4" size={48} />
        <h2 className="text-3xl font-fantasy-decorative text-fantasy-gold mb-2">
          Divine Ascension
        </h2>
        <p className="text-gray-300 font-fantasy">
          Choose your domain and begin your reign over Vaeleth
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Your Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your real name"
          required
          helperText="This identifies you to other players"
        />
        
        <Input
          label="Deity Name"
          value={deityName}
          onChange={(e) => setDeityName(e.target.value)}
          placeholder="Enter your divine name"
          required
          helperText="Your divine title in the world of Vaeleth"
        />
        
        <Select
          label="Divine Domain"
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value as Domain)}
          options={domainOptions}
          required
        />
        
        <div className="bg-fantasy-dark/50 p-4 rounded-lg border border-fantasy-purple/30">
          <h4 className="text-fantasy-gold font-fantasy font-medium mb-2">
            Domain of {selectedDomain}
          </h4>
          <p className="text-gray-300 text-sm">
            {DOMAIN_DESCRIPTIONS[selectedDomain]}
          </p>
        </div>
        
        <Button
          type="submit"
          className="w-full"
          loading={isSubmitting}
          disabled={!playerName.trim() || !deityName.trim() || isSubmitting}
        >
          Ascend as {deityName || 'Your Deity'}
        </Button>
      </form>
      
      <div className="mt-8 p-4 bg-fantasy-dark/30 rounded-lg">
        <h4 className="text-fantasy-gold font-fantasy font-medium mb-2">
          What happens next?
        </h4>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>• Create your fantasy race with unique characteristics</li>
          <li>• Begin weekly actions to shape the world</li>
          <li>• Interact with other deities through diplomacy and conflict</li>
          <li>• Watch your influence grow across the timeline</li>
        </ul>
      </div>
    </div>
  );
};

export default DeityCreator;