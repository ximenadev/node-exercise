import fs from 'fs';

const readFilePromise = (fileName: string) =>
  new Promise((resolve, reject) =>
    fs.readFile(fileName, 'utf8', (err: Error | null, data: string) => {
      if (err) reject('Error reading file: ' + err.message);

      resolve(data);
    })
  );

const writeFilePromise = (fileName: string, data: string) =>
  new Promise((resolve, reject) =>
    fs.writeFile(fileName, data, 'utf8', (err: Error | null) => {
      if (err) reject('Error writing file: ' + err.message);

      resolve('File written successfully');
    })
  );

/////////////// Promise version
// readFilePromise('./dog.txt')
//   .then(data => fetch(`https://dog.ceo/api/breed/${data}/images/random`))
//   .then(res => res.json())
//   .then(data => writeFilePromise('./dog-img.txt', data.message))
//   .catch(err => console.log(err.message || err));

/////////////// Async/Await version
// const getDogPic = async () => {
//   try {
//     const dogBreed = await readFilePromise('./dog.txt');
//     const res = await fetch(
//       `https://dog.ceo/api/breed/${dogBreed}/images/random`
//     );
//     const data = await res.json();
//     await writeFilePromise('./dog-img.txt', data.message);
//   } catch (err: unknown) {
//     if (err instanceof Error) throw err.message || err;
//   } finally {
//     console.log('Done getting dog pic!');
//   }
// };

// getDogPic();

//////////////// Promise.all version

(async () => {
  try {
    const dogBreed = await readFilePromise('./dog.txt');
    const res1 = fetch(`https://dog.ceo/api/breed/${dogBreed}/images/random`);
    const res2 = fetch(`https://dog.ceo/api/breed/${dogBreed}/images/random`);
    const res3 = fetch(`https://dog.ceo/api/breed/${dogBreed}/images/random`);

    const data = await Promise.all([res1, res2, res3]);
    const imgs = data.map(d => d.json());
    const imgUrls = await Promise.all(imgs);
    console.log(imgUrls);

    await writeFilePromise(
      './dog-img.txt',
      imgUrls.map(img => img.message).join('\n')
    );
  } catch (err: unknown) {
    if (err instanceof Error) throw err.message || err;
  } finally {
    console.log('Done getting dog pics!');
  }
})();
