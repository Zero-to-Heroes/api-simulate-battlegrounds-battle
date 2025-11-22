import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { performEntitySpawns } from '../../../simulation/spawns';
import { TempCardIds } from '../../../temp-card-ids';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const TimewarpedAlleycat: EndOfTurnCard = {
	cardIds: [TempCardIds.TimewarpedAlleycat, TempCardIds.TimewarpedAlleycat_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedAlleycat_G ? 2 : 1;
		const spawnInput: DeathrattleTriggeredInput = {
			boardWithDeadEntity: input.board,
			boardWithDeadEntityHero: input.hero,
			gameState: input.gameState,
			deadEntity: minion,
			otherBoard: input.otherBoard,
			otherBoardHero: input.otherHero,
		};
		const spawns = simplifiedSpawnEntities(CardIds.Alleycat_TabbycatToken_BG_CFM_315t, mult, spawnInput);
		spawns.forEach((e) => {
			e.attack = minion.attack;
			e.health = minion.health;
			e.maxHealth = minion.maxHealth;
			e.maxAttack = minion.maxAttack;
		});
		performEntitySpawns(
			spawns,
			input.board,
			input.hero,
			minion,
			input.board.indexOf(minion),
			input.otherBoard,
			input.otherHero,
			input.gameState,
		);
		return true;
	},
};
