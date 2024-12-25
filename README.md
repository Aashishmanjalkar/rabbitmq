# RabbitMQ Project

This project demonstrates the usage of RabbitMQ for message queuing in a distributed system. It includes examples of different exchange types and how to set up RabbitMQ using Docker.

## Prerequisites

- Docker
- Node.js (version 14 or higher)
- npm (usually comes with Node.js)

## Installation

### Setting up RabbitMQ with Docker

Run the following command to start a RabbitMQ container:

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management
