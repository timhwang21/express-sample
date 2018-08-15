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
		try {
			const password = await bcrypt.hash(req.body.password, 10);
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
					name: req.body.name,
					email: req.body.email,
					password,
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
					user_id: req.params.user_id,
				}
			);

			res.status(200).json({
				data: user,
			});
		} catch (err) {
			err.code === 0
				? res.status(404).json(err)
				: res.status(500).json(err);
		}
	})
	.put(async (req, res) => {
		try {
			const user = await db.one(
				`
					UPDATE users
					SET email = $(email)
					where id = $(id)
					RETURNING
						id,
						name,
						email
				`,
				{
					id: req.params.user_id,
					email: req.body.email,
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
		try {
			const user = await db.one(
				`
					UPDATE users
					SET is_deleted = TRUE
					where id = $(id)
					RETURNING
						id,
						is_deleted
				`,
				{
					id: req.params.user_id,
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
	try {
		const user = await db.one(
			`
				UPDATE users
				SET is_deleted = FALSE
				WHERE id = $(id)
				RETURNING
					id,
					is_deleted
			`,
			{
				id: req.params.user_id,
			},
		);

		res.status(200).json({
			data: user,
		});
	} catch (err) {
		res.status(500).json(err);
	}
})

router.put('/:user_id(\\d+)/change_password', async (req, res) => {
	const { password, password_confirm, password_old } = req.body;

	// Ensure provided current password is correct
	let user;

	try {
		user = await db.one(
			`
				SELECT password
				FROM users
				WHERE id = $(user_id)
			`,
			{
				user_id: req.params.user_id,
			},
		);
	} catch (err) {
		return res.status(500).json(err);
	}

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
			]
		})
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
		const password = await bcrypt.hash(req.body.password, 10);
		const user = await db.one(
			`
				UPDATE users
				SET password = $(password)
				WHERE id = $(id)
				RETURNING
					id
			`,
			{
				id: req.params.user_id,
				password,
			},
		);

		return res.status(200).json({
			data: user,
		});
	} catch (err) {
		return res.status(500).json(err);
	}
})

module.exports = router;
