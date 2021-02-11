cd ./packages/raxy-polyfill; 
npm install;

cd ../..;
npm run clean;
npm run declarations:all;
npm run webpack;