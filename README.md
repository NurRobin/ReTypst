# ReTypst

ReTypst is a web-based Typst editor designed for real-time editing and viewing of Typst documents. It provides a collaborative environment where multiple users can work on Typst documents simultaneously.

## Key Features

- **Real-time Collaboration**: Multiple users can edit the same document simultaneously with changes reflected in real-time.
- **Typst Document Editing**: Full-featured editor for creating and modifying Typst documents.
- **PDF Generation**: Compile Typst documents into PDF format for easy sharing and printing.
- **Document Management**: Save and load Typst documents from the server.
- **Asset Handling**: Manage assets such as images and bibliographies within your documents.

## API Endpoints

- **Fetch Document**: `/api/typst/fetch`
- **Save Document**: `/api/typst/save`
- **Compile Document**: `/api/typst/compile`

## Getting Started

To get started with ReTypst, follow these steps:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run the Development Server**:
   ```bash
   npm run dev
   ```

3. **Open the Application**:
   Open [http://localhost:3000](http://localhost:3000) in your browser to start using ReTypst.

## Project Structure

- **app/**: Contains the main application files.
  - **api/**: API routes for fetching, saving, and compiling Typst documents.
  - **editor/**: Editor components and pages.
  - `layout.tsx`: Layout component for the application.
  - `page.tsx`: Main page component.
- **documents/**: Contains Typst documents and related assets.
  - `*.typ`: Typst document files.
- **public/**: Public assets.
- **.next/**: Next.js build output.
- **.eslintrc.json**: ESLint configuration.
- **next-env.d.ts**: TypeScript environment configuration.
- **next.config.mjs**: Next.js configuration.
- **postcss.config.mjs**: PostCSS configuration.
- **tailwind.config.ts**: Tailwind CSS configuration.
- **tsconfig.json**: TypeScript configuration.
- **package.json**: Project dependencies and scripts.

## Learn More

For more information about Typst and its capabilities, visit the [Typst documentation](https://typst.app/docs/).

Feel free to contribute to the project by submitting issues or pull requests on the [GitHub repository](https://github.com/your-repo/retypst).