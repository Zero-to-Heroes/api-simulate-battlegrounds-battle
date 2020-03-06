import { BoardEntity } from './board-entity';

// This example demonstrates a NodeJS 8.10 async handler[1], however of course you could use
// the more traditional callback-style handler.
// [1]: https://aws.amazon.com/blogs/compute/node-js-8-10-runtime-now-available-in-aws-lambda/
export default async (event): Promise<any> => {
	try {
		const battleInput = JSON.parse(event.body);
		const playerBoard: readonly BoardEntity[] = battleInput.playerBoard;
		const opponentBoard: readonly BoardEntity[] = battleInput.opponentBoard;

		// TODO: add implicit info from cards (like poisonous and stuff if not present)
		// remove enchantments, except the ones from entities on the board (auras) (to be confirmed)
		// and micro machine magnetic, because of hte deathrattle

		const response = {
			statusCode: 200,
			isBase64Encoded: false,
			body: JSON.stringify({ 'hop': 'hop' }),
		};
		console.log('sending back success reponse');
		return response;
	} catch (e) {
		console.error('issue retrieving stats', e);
		const response = {
			statusCode: 500,
			isBase64Encoded: false,
			body: JSON.stringify({ message: 'not ok', exception: e }),
		};
		console.log('sending back error reponse', response);
		return response;
	}
};
