import { ReferenceCard } from '../services/reference-card';
import { http } from '../services/utils';

export class AllCardsService {
	private allCards: ReferenceCard[];

	// We keep this synchronous because we ensure, in the game init pipeline, that loading cards
	// is the first thing we do
	public getCard(id: string): ReferenceCard {
		const candidates = this.allCards.filter(card => card.id === id);
		if (!candidates || candidates.length === 0) {
			console.debug('Could not find card for id', id);
			return {} as ReferenceCard;
		}
		return candidates[0];
	}

	public getCardFromDbfId(dbfId: number): ReferenceCard {
		return this.allCards.find(card => card.dbfId === dbfId);
	}

	public getCardsFromDbfIds(dbfIds: number[]): ReferenceCard[] {
		return this.allCards.filter(card => dbfIds.indexOf(card.dbfId) !== -1);
	}

	public getCards(): ReferenceCard[] {
		return this.allCards;
	}

	public async initializeCardsDb(): Promise<void> {
		console.debug('[all-cards] initializing card db');
		return new Promise<void>(async (resolve, reject) => {
			if (this.allCards) {
				console.debug('[all-cards] already loaded all cards');
				resolve();
				return;
			}
			console.debug('[all-cards] retrieving local cards');
			const cardsStr = await http(`https://static.zerotoheroes.com/hearthstone/jsoncards/cards.json`);
			this.allCards = JSON.parse(cardsStr);
			resolve();
		});
	}
}
