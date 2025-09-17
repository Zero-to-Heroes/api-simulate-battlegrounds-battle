import { CardIds } from '../../../services/card-ids';
import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { AvengeInput } from '../../../simulation/avenge';
import { addStatsToBoard } from '../../../utils';
import { AvengeCard } from '../../card.interface';

export const ChampionOfThePrimus: AvengeCard = {
	cardIds: [CardIds.ChampionOfThePrimus_BG27_029, CardIds.ChampionOfThePrimus_BG27_029_G],
	baseAvengeValue: (cardId: string) => 3,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const championPrimusStat = minion.cardId === CardIds.ChampionOfThePrimus_BG27_029_G ? 2 : 1;
		input.hero.globalInfo.UndeadAttackBonus += championPrimusStat;
		addStatsToBoard(
			minion,
			input.board,
			input.hero,
			championPrimusStat,
			0,
			input.gameState,
			Race[Race.UNDEAD],
			false,
		);
	},
};
