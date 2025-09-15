import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  ...compat.extends('plugin:prettier/recommended'), // eslint의 포매팅을 prettier로 사용.
  ...compat.extends('prettier'), // eslint-config-prettier prettier와 중복된 eslint 규칙 제거
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off',
      'react/react-in-jsx-scope': 'off', // react 17부턴 import 안해도돼서 기능 끔
      // 경고표시, 파일 확장자를 .ts나 .tsx 모두 허용함
      'react/jsx-filename-extension': ['warn', { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
      'no-useless-catch': 'off', // 불필요한 catch 못쓰게 하는 기능 끔
      'no-multiple-empty-lines': 'warn', // 여러 줄 공백 금지
      '@typescript-eslint/no-unused-vars': 'warn', // 사용되지 않는 변수 감지
    },
  },
];

export default eslintConfig;
