import { CardIds } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { FullGameState } from './internal-game-state';
import { modifyStats } from './stats';

export const afterDiscover = (
	hero: BgsPlayerEntity,
	board: BoardEntity[],
	picked: string,
	ignored: string[],
	gameState: FullGameState,
) => {
	if (!ignored?.length) {
		return;
	}

	for (const entity of board) {
		switch (entity.cardId) {
			case CardIds.DepravedFelfin_BG30_115:
			case CardIds.DepravedFelfin_BG30_115_G:
				const felfinMultiplier = entity.cardId === CardIds.DepravedFelfin_BG30_115 ? 1 : 2;
				const baseTotalAttack = ignored
					.map((cardId) => gameState.allCards.getCard(cardId).attack)
					.reduce((a, b) => a + b, 0);
				const baseTotalHealth = ignored
					.map((cardId) => gameState.allCards.getCard(cardId).health)
					.reduce((a, b) => a + b, 0);
				modifyStats(
					entity,
					baseTotalAttack * felfinMultiplier,
					baseTotalHealth * felfinMultiplier,
					board,
					hero,
					gameState,
				);
				break;
		}
	}
};