-- HONEYPOT DATABASE DUMP
-- This is a fake file for detecting unauthorized access

-- MySQL dump 10.13  Distrib 8.0.28
-- Server version: 8.0.28

CREATE DATABASE IF NOT EXISTS `production_db`;
USE `production_db`;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `role` enum('admin','user','moderator') DEFAULT 'user',
  PRIMARY KEY (`id`)
);

--
-- Dumping data for table `users`
--

INSERT INTO `users` VALUES
(1,'admin','$2y$10$fakehashforhoneypotdetection','admin@example.com','admin'),
(2,'operator','$2y$10$anotherfakehashforhoneypot','ops@example.com','moderator');

--
-- Table structure for table `api_keys`
--

DROP TABLE IF EXISTS `api_keys`;
CREATE TABLE `api_keys` (
  `id` int NOT NULL AUTO_INCREMENT,
  `key` varchar(64) NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`)
);

INSERT INTO `api_keys` VALUES
(1,'fake_api_key_honeypot_12345',1),
(2,'fake_api_key_honeypot_67890',2);

-- This is a honeypot file. Access attempts are logged.
