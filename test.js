const dogs = [
    {
      dogId: 1,
      name: 'Fido',
      age: 2
    },
    {
      dogId: 2,
      name: 'Fluffy',
      age: 10
    }
];

let dogId = 3;

console.log(dogs.find(dog => dog["dogId"] === dogId))

