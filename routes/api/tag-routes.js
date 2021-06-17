const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (request, response) => {
  // find all tags
  // be sure to include its associated Product data
  try {
    const tagData = await Tag.findAll({
      include: [Product],
    });
    response.status(200).json(tagData);
  } catch (error) {
    
  }
});

router.get('/:id', async (request, response) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try {
    const tagData = await Tag.findByPk(request.params.id,
      {
        include: [Product]
      });

    if (!tagData) {
      response.status(404).json({ message: 'Tag was not found for id ' + request.params.id });
      return;
    }

    response.status(200).json(tagData);
  } catch (error) {
    response.status(404).json(error);
  }
});

router.post('/', async (request, response) => {
  // create a new tag
  try {
    const tagData = Tag.create(request.body);
    tagData.then(resolveResult => {
      return response.status(200).json(resolveResult);
    });

  } catch (error) {
    response.status(error).json({ message: 'Tag was not added' });
  };
});

router.put('/:id', async (request, response) => {
  // update a tag's name by its `id` value
  try {
    let tagUpdated = await Tag.update(
      { tag_name: request.body.tag_name },
      {
        returning: true, where: { id: request.params.id }
      })
    response.status(200).json(tagUpdated);
  } catch (error) {
    response.status(400).json(error);
  }
});

router.delete('/:id', async (request, response) => {
  // delete on tag by its `id` value
  try {
    const tagData = await Tag.destroy({
      where: {
        id: request.params.id,
      },
    });

    if (!tagData) {
      response.status(404).json({ message: 'No Tag for id ' + request.params.id + ' was found, so it was not deleted' });
      return;
    }

    response.status(200).json(tagData);
  } catch (error) {
    response.status(500).json(error);
  }
});

module.exports = router;
