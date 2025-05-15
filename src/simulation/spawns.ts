import { BgsPlayerEntity, BoardTrinket } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { addMinionToBoard } from './add-minion-to-board';
import { simulateAttack } from './attack';
import { FullGameState } from './internal-game-state';
import { onMinionFailedToSpawn } from './spawn-fail';

export const performEntitySpawns = (
	candidateEntities: readonly BoardEntity[],
	boardWithKilledMinion: BoardEntity[],
	boardWithKilledMinionHero: BgsPlayerEntity,
	spawnSourceEntity: BoardEntity | BgsPlayerEntity | BoardTrinket,
	spawnSourceEntityIndexFromRight: number,
	opponentBoard: BoardEntity[],
	opponentBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
	applySelfAuras = true,
): readonly BoardEntity[] => {
	const aliveEntites = candidateEntities.filter((entity) => entity.health > 0 && !entity.definitelyDead);
	const spawnedEntities = [];
	for (let i = 0; i < aliveEntites.length; i++) {
		const newMinion = aliveEntites[i];
		// All entities have been spawned
		if (boardWithKilledMinion.length >= 7) {
			for (let j = i; j < aliveEntites.length; j++) {
				onMinionFailedToSpawn(aliveEntites[j], boardWithKilledMinion, boardWithKilledMinionHero, gameState);
			}
			break;
		}
		// Avoid minions spawning backwards (we don't have this issue if we add all elements at
		// the same time, but here we want to be able to attack after each spawn, which in turn
		// means that the minion can die before the other one spawns)
		// In boardWithKilledMinion, the dead minion has already been removed
		spawnSourceEntityIndexFromRight = newMinion.spawnIndexFromRight ?? spawnSourceEntityIndexFromRight;
		const indexToSpawnAt = Math.max(0, boardWithKilledMinion.length - spawnSourceEntityIndexFromRight);
		addMinionToBoard(
			boardWithKilledMinion,
			boardWithKilledMinionHero,
			opponentBoard,
			opponentBoardHero,
			indexToSpawnAt,
			newMinion,
			gameState,
			true,
			applySelfAuras,
		);
		if (newMinion.attackImmediately) {
			// console.debug(
			// 	'\nattack immediately\n',
			// 	stringifySimple(boardWithKilledMinion, gameState.allCards),
			// 	'\n',
			// 	stringifySimple(opponentBoard, gameState.allCards),
			// );
			// Whenever we are already in a combat phase, we need to first clean up the state
			const actualAttacker = simulateAttack(
				boardWithKilledMinion,
				boardWithKilledMinionHero,
				opponentBoard,
				opponentBoardHero,
				gameState,
			);
			// console.debug(
			// 	'after attack immediately\n',
			// 	stringifySimple(boardWithKilledMinion, gameState.allCards),
			// 	'\n',
			// 	stringifySimple(opponentBoard, gameState.allCards),
			// );
			// So that, even if the opponent's board is temporarily empty (e.g. no minion, but a token will
			// spawn in the enchantments resolution phase), the minion won't attack right away again
			// In case of attack immediately + multiple spawns minins, it's possible that the minion for which
			// we triggered the attack simulation was not the one who actually attacked
			if (actualAttacker) {
				actualAttacker.attackImmediately = false;
			}
			// Can happen if the attackImmediately minion spawns first, opponent board is empty, then opponent minino spawns
			else {
				newMinion.attackImmediately = false;
			}
		}
		if (newMinion.health > 0 && !newMinion.definitelyDead) {
			spawnedEntities.push(newMinion);
		}
	}

	gameState.spectator.registerMinionsSpawn(spawnSourceEntity, boardWithKilledMinion, spawnedEntities);
	return spawnedEntities;
};
