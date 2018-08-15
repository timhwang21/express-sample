var express = require('express');
var bcrypt = require('bcrypt');
var router = express.Router();

var db = require('../db');

router.route('/')
	.get(async (req, res) => {
		try {
			const users = await db.any(
				`
					SELECT
						id,
						name,
						email,
						is_deleted
					FROM users
				`
			);

			res.status(200).json({
				data: users,
			});
		} catch (err) {
			res.status(500).json(err);
		}
	})
	.post(async (req, res) => {
		const { name, email, password } = req.body;

		try {
			const user = await db.one(
				`
					INSERT INTO users(name, email, password)
					  VALUES ($(name), $(email), $(password))
					RETURNING
						id,
						name,
						email,
						is_deleted
				`,
				{
					name,
					email,
					password: await bcrypt.hash(password, 10),
				},
			);

			res.status(200).json({
				data: user,
			})
		} catch (err) {
			res.status(500).json(err);
		}
	});

router.route('/:user_id(\\d+)')
	.get(async (req, res) => {
		const { user_id } = req.params;

		try {
			const user = await db.one(
				`
					SELECT
						id,
						name,
						email,
						is_deleted
					FROM users
					WHERE id = $(user_id)
				`,
				{
					user_id,
				}
			);

			res.status(200).json({
				data: user,
			});
		} catch (err) {
			res.status(500).json(err);
		}
	})
	.put(async (req, res) => {
		const { user_id } = req.params;
		const { email } = req.body;

		try {
			const user = await db.one(
				`
					UPDATE users
					SET email = $(email)
					where id = $(user_id)
					RETURNING
						id,
						name,
						email
				`,
				{
					user_id,
					email,
				},
			);

			res.status(200).json({
				data: user,
			});
		} catch (err) {
			res.status(500).json(err);
		}
	})
	.delete(async (req, res) => {
		const { user_id } = req.params;

		try {
			const user = await db.one(
				`
					UPDATE users
					SET is_deleted = TRUE
					where id = $(user_id)
					RETURNING
						id,
						is_deleted
				`,
				{
					user_id,
				},
			);

			res.status(200).json({
				data: user,
			});
		} catch (err) {
			res.status(500).json(err);
		}
	});

router.put('/:user_id(\\d+)/undelete', async (req, res) => {
	const { user_id } = req.params;

	try {
		const user = await db.one(
			`
				UPDATE users
				SET is_deleted = FALSE
				WHERE id = $(user_id)
				RETURNING
					id,
					is_deleted
			`,
			{
				user_id,
			},
		);

		res.status(200).json({
			data: user,
		});
	} catch (err) {
		res.status(500).json(err);
	}
})

router.put('/:user_id(\\d+)/change_password', (req, res) => {
	const { user_id } = req.params;
	const { password, password_confirm, password_old } = req.body;

	try {
		db.task(async t => {
			// Note: We want these requests to be blocking so errors come back
			// deterministically. It's a bit slower, but also more consistent.
			//
			// Ensure provided current password is correct
			try {
				const user = await t.one(
					`
						SELECT password
						FROM users
						WHERE id = $(user_id)
					`,
					{
						user_id,
					},
				);

				const match = await bcrypt.compare(password_old, user.password);

				if (!match) {
					return res.status(400).json({
						errors: [
							{
								status: 400,
								source: {
									pointer: req.baseUrl,
								},
								title: 'Invalid password',
								message: 'Current password is incorrect.'
							}
						],
					});
				}
			} catch (err) {
				return res.status(500).json(err);
			}

			// Ensure passwords match
			if (password !== password_confirm) {
				return res.status(400).json({
					errors: [
						{
							status: 400,
							source: {
								pointer: req.baseUrl,
							},
							title: 'Passwords did not match',
							message: 'Provided passwords did not match.',
						}
					]
				});
			}

			// Update password
			try {
				const user = await t.one(
					`
						UPDATE users
						SET password = $(password)
						WHERE id = $(user_id)
						RETURNING
							id
					`,
					{
						user_id,
						password: await bcrypt.hash(password, 10),
					},
				);

				return res.status(200).json({
					data: user,
				});
			} catch (err) {
				return res.status(500).json(err);
			}
		});
	} catch (err) {
		return res.status(500).json(err);
	}
})

module.exports = router;
