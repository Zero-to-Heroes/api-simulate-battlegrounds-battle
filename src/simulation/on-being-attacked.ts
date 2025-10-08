import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { hasOnMinionAttacked } from '../cards/card.interface';
import { cardMappings } from '../cards/impl/_card-mappings';
import { updateDivineShield } from '../keywords/divine-shield';
import { updateReborn } from '../keywords/reborn';
import { updateVenomous } from '../keywords/venomous';
import { CardIds } from '../services/card-ids';
import { addStatsToBoard } from '../utils';
import { FullGameState } from './internal-game-state';
import { handlePackTactics, handleSnakeTrap, handleSplittingImage, handleVenomstrikeTrap } from './secrets';
import { modifyStats } from './stats';

export const applyOnBeingAttackedBuffs = (
	attackerEntity: BoardEntity,
	attackerBoard: BoardEntity[],
	attackerHero: BgsPlayerEntity,
	defendingEntity: BoardEntity,
	defendingBoard: BoardEntity[],
	defendingPlayerEntity: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	// We need to respect the order of the secrets
	for (const secret of (defendingPlayerEntity.secrets ?? []).filter((s) => !s.triggered)) {
		switch (secret.cardId) {
			case CardIds.AutodefenseMatrix_TB_Bacon_Secrets_07:
			case CardIds.AutodefenseMatrix_BetterAutodefenseMatrix_TB_Bacon_Secrets_07b:
				if (!defendingEntity.divineShield) {
					secret.triggered = true;
					updateDivineShield(
						defendingEntity,
						defendingBoard,
						defendingPlayerEntity,
						attackerHero,
						true,
						gameState,
					);
					if (secret.cardId === CardIds.AutodefenseMatrix_BetterAutodefenseMatrix_TB_Bacon_Secrets_07b) {
						defendingEntity.strongDivineShield = true;
					}
				}
				break;
			case CardIds.SplittingImage_TB_Bacon_Secrets_04:
				if (defendingBoard.length < 7) {
					secret.triggered = true;
					handleSplittingImage(
						defendingEntity,
						defendingBoard,
						defendingPlayerEntity,
						attackerBoard,
						attackerHero,
						gameState,
					);
				}
				break;
			case CardIds.PackTactics_TB_Bacon_Secrets_15:
			case CardIds.PackTactics_BetterPackTactics_TB_Bacon_Secrets_15b:
				if (defendingBoard.length < 7) {
					secret.triggered = true;
					handlePackTactics(
						defendingEntity,
						defendingBoard,
						defendingPlayerEntity,
						attackerBoard,
						attackerHero,
						gameState,
						secret.cardId,
					);
				}
				break;
			case CardIds.SnakeTrap_TB_Bacon_Secrets_02:
				if (defendingBoard.length < 7) {
					secret.triggered = true;
					handleSnakeTrap(
						defendingEntity,
						defendingBoard,
						defendingPlayerEntity,
						attackerBoard,
						attackerHero,
						gameState,
					);
				}
				break;
			case CardIds.VenomstrikeTrap_TB_Bacon_Secrets_01:
			case CardIds.VenomstrikeTrap_BetterVenomstrikeTrap_TB_Bacon_Secrets_01b:
				if (defendingBoard.length < 7) {
					secret.triggered = true;
					const spawns = handleVenomstrikeTrap(
						defendingEntity,
						defendingBoard,
						defendingPlayerEntity,
						attackerBoard,
						attackerHero,
						gameState,
					);
					if (secret.cardId === CardIds.VenomstrikeTrap_BetterVenomstrikeTrap_TB_Bacon_Secrets_01b) {
						for (const spawn of spawns) {
							updateReborn(spawn, true, defendingBoard, defendingPlayerEntity, attackerHero, gameState);
						}
					}
				}
				break;
		}
	}

	for (const entity of defendingBoard) {
		const onBeingAttackedImpl = cardMappings[entity.cardId];
		if (hasOnMinionAttacked(onBeingAttackedImpl)) {
			onBeingAttackedImpl.onAttacked(entity, {
				defendingEntity: defendingEntity,
				attacker: attackerEntity,
				attackingHero: attackerHero,
				attackingBoard: attackerBoard,
				defendingHero: defendingPlayerEntity,
				defendingBoard: defendingBoard,
				gameState,
			});
		}
	}

	if (defendingEntity.taunt) {
		// const champions = defendingBoard.filter((entity) => entity.cardId === CardIds.ChampionOfYshaarj_BGS_111);
		// const goldenChampions = defendingBoard.filter(
		// 	(entity) => entity.cardId === CardIds.ChampionOfYshaarj_TB_BaconUps_301,
		// );
		// champions.forEach((entity) => {
		// 	modifyStats(entity, entity, 1, 2, defendingBoard, defendingPlayerEntity, gameState);
		// });
		// goldenChampions.forEach((entity) => {
		// 	modifyStats(entity, entity, 2, 4, defendingBoard, defendingPlayerEntity, gameState);
		// });

		defendingBoard
			.filter(
				(e) =>
					e.cardId === CardIds.WanderingTreant_TB_BaconShop_HERO_95_Buddy ||
					e.cardId === CardIds.WanderingTreant_TB_BaconShop_HERO_95_Buddy_G,
			)
			.forEach((entity) => {
				const mult = entity.cardId === CardIds.WanderingTreant_TB_BaconShop_HERO_95_Buddy ? 1 : 2;
				addStatsToBoard(entity, defendingBoard, defendingPlayerEntity, 1 * mult, 1 * mult, gameState);
			});
	}

	// Based on defending entity
	// if (defendingEntity.cardId === CardIds.TormentedRitualist_BGS_201) {
	// 	const neighbours = getNeighbours(defendingBoard, defendingEntity);
	// 	neighbours.forEach((entity) => {
	// 		modifyStats(entity, defendingEntity, 1, 1, defendingBoard, defendingPlayerEntity, gameState);
	// 	});
	// } else if (defendingEntity.cardId === CardIds.TormentedRitualist_TB_BaconUps_257) {
	// 	const neighbours = getNeighbours(defendingBoard, defendingEntity);
	// 	neighbours.forEach((entity) => {
	// 		modifyStats(entity, defendingEntity, 2, 2, defendingBoard, defendingPlayerEntity, gameState);
	// 	});
	// } else
	if (
		defendingEntity.cardId === CardIds.DozyWhelp_BG24_300 ||
		defendingEntity.cardId === CardIds.DozyWhelp_BG24_300_G
	) {
		modifyStats(
			defendingEntity,
			defendingEntity,
			defendingEntity.cardId === CardIds.DozyWhelp_BG24_300_G ? 2 : 1,
			0,
			defendingBoard,
			defendingPlayerEntity,
			gameState,
		);
	} else if (
		[CardIds.AdaptableBarricade_BG27_022, CardIds.AdaptableBarricade_BG27_022_G].includes(
			defendingEntity.cardId as CardIds,
		)
	) {
		// https://twitter.com/LoewenMitchell/status/1692225556559901031?s=20
		const totalStats = defendingEntity.attack + defendingEntity.health;
		const attackerAttack = attackerEntity.attack;
		if (defendingEntity.divineShield) {
			defendingEntity.health = 1;
			defendingEntity.attack = totalStats - defendingEntity.health;
		} else if (attackerEntity.venomous || attackerEntity.poisonous) {
			// Do nothing
		} else if (attackerAttack < totalStats) {
			defendingEntity.health = attackerAttack + 1;
			defendingEntity.attack = totalStats - defendingEntity.health;
		}
		// } else if (
		// 	[CardIds.GraniteGuardian_BG24_001, CardIds.GraniteGuardian_BG24_001_G].includes(
		// 		defendingEntity.cardId as CardIds,
		// 	)
		// ) {
		// 	setEntityStats(attackerEntity, attackerEntity.attack, 1, attackerBoard, attackerHero, gameState);
		// 	// attackerEntity.health = 1;
	} else if (
		[CardIds.WaywardGrimscale_BG28_406, CardIds.WaywardGrimscale_BG28_406_G].includes(
			defendingEntity.cardId as CardIds,
		)
	) {
		updateVenomous(defendingEntity, true, defendingBoard, defendingPlayerEntity, attackerHero, gameState);
	}
};

export interface OnMinionAttackedInput {
	attacker: BoardEntity;
	attackingHero: BgsPlayerEntity;
	attackingBoard: BoardEntity[];
	defendingEntity: BoardEntity;
	defendingHero: BgsPlayerEntity;
	defendingBoard: BoardEntity[];
	gameState: FullGameState;
}
