import { Race, ReferenceCard } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../../../bgs-player-entity';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { Mutable, pickMultipleRandomDifferent } from '../../../services/utils';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { FullGameState } from '../../../simulation/internal-game-state';
import { magnetizeToTarget } from '../../../simulation/magnetize';
import { OnAttackInput } from '../../../simulation/on-attack';
import { hasCorrectTribe } from '../../../utils';
import { DeathrattleSpawnCard, RallyCard } from '../../card.interface';

export const ApexisGuardian: DeathrattleSpawnCard & RallyCard = {
	cardIds: [CardIds.ApexisGuardian_BG34_173, CardIds.ApexisGuardian_BG34_173_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		handleEffect(minion, {
			board: input.boardWithDeadEntity,
			hero: input.boardWithDeadEntityHero,
			gameState: input.gameState,
			otherBoard: input.otherBoard,
			otherHero: input.otherBoardHero,
		});
		return []
	},
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		handleEffect(minion, {
			board: input.attackingBoard,
			hero: input.attackingHero,
			gameState: input.gameState,
			otherBoard: input.defendingBoard,
			otherHero: input.defendingHero,
		});
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
}

const handleEffect = (minion: BoardEntity, input: {
	board: BoardEntity[];
	hero: BgsPlayerEntity;
	gameState: FullGameState;
	otherBoard: BoardEntity[];
	otherHero: BgsPlayerEntity;
}) => {
	const loops = minion.cardId === CardIds.ApexisGuardian_BG34_173_G ? 2 : 1;
	const cardsToMagnetize = [];
	// Magnetizes to the same targets
	const possibleTargets = input.board.filter(
		(e) =>
			e.health > 0 &&
			!e.definitelyDead &&
			e !== minion &&
			hasCorrectTribe(
				e,
				input.otherHero,
				Race.MECH,
				input.gameState.anomalies,
				input.gameState.allCards,
			),
	);
	const targets = pickMultipleRandomDifferent(possibleTargets, 1);
	for (let i = 0; i < loops; i++) {
		const cardIdToMagnetize = input.gameState.cardsData.getRandomMagneticVolumizer(
			input.otherHero,
			input.gameState.anomalies,
			6,
		);
		const cardToMagnetize: Mutable<ReferenceCard> = {
			...input.gameState.allCards.getCard(cardIdToMagnetize),
		};
		// cardToMagnetize.attack = 0;
		// cardToMagnetize.health = 0;
		cardsToMagnetize.push(cardToMagnetize);
	}
	magnetizeToTarget(
		targets,
		minion,
		cardsToMagnetize,
		input.board,
		input.otherHero,
		input.otherBoard,
		input.otherHero,
		input.gameState,
	);
	return [];
}

