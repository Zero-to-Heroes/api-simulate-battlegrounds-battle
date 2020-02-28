import { AllCardsService } from './cards';

const REMOVED_CARD_IDS = [
	'GVG_085', // Annoy-o-Tron
	'BGS_025', // Mounted Raptor
	'GIL_681', // Nightmare Amalgam
	'GVG_058', // Shielded Minibot
	'ULD_179', // Phallanx Commander
	'OG_145', // Psych-o-Tron
	'UNG_037', // Tortollian Shellraiser
	'GIL_655', // Festeroot Hulk
	'BGS_024', // Piloted Sky Golem
	'UNG_010', // Sated Threshadon
	'OG_300', // Boogeymonster
];

export class CardsSpawn {
	public shredderSpawns: readonly string[];
	public ghastcoilerSpawns: readonly string[];
	public sneedsSpawns: readonly string[];

	constructor(private readonly allCards: AllCardsService) {}

	public init() {
		this.shredderSpawns = this.allCards
			.getCards()
			.filter(card => card.techLevel)
			.filter(card => !card.id.startsWith('TB_BaconUps')) // Ignore golden
			.filter(card => card.cost === 2)
			.map(card => card.id);
		this.ghastcoilerSpawns = this.allCards
			.getCards()
			.filter(card => card.techLevel)
			.filter(card => !card.id.startsWith('TB_BaconUps')) // Ignore golden
			.filter(card => card.id !== 'BGS_008')
			.filter(card => card.mechanics && card.mechanics.indexOf('DEATHRATTLE') !== -1)
			.filter(card => REMOVED_CARD_IDS.indexOf(card.id) === -1)
			.map(card => card.id);
		this.sneedsSpawns = this.allCards
			.getCards()
			.filter(card => card.techLevel)
			.filter(card => !card.id.startsWith('TB_BaconUps')) // Ignore golden
			.filter(card => card.id !== 'GVG_114')
			.filter(card => card.rarity === 'Legendary')
			.filter(card => REMOVED_CARD_IDS.indexOf(card.id) === -1)
			.map(card => card.id);
	}
}
