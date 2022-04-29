import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import styled from 'styled-components';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  Link,
  TextField,
  Typography,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api, {
  Category,
  Teacher,
  TeacherDisciplines,
  Test,
  TestByTeacher,
} from "../services/api";

function Instructors() {

  const navigate = useNavigate();
  const { token } = useAuth();
  const [teachersDisciplines, setTeachersDisciplines] = useState<TestByTeacher[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [nameSearch, setNameSearch] = useState<String>('');
  const [open, setOpen] = useState<Boolean>(false);
  const [teachersNameAndId, setTeachersNameAndId] = useState<Teacher[]>([]);

  // useEffect(() => {
  //   function getTeachersNameAndId() {
  //     const teacherData = teachersDisciplines.map((teacherDiscipline) => {
  //       console.log(teacherDiscipline)
  //       return {
  //         id: teacherDiscipline.teacher.id,
  //         name: teacherDiscipline.teacher.name
  //       }
  //     })
  //     setTeachersNameAndId(teacherData);  
  //   };
  //   getTeachersNameAndId();
  // }, [teachersDisciplines]);

  // console.log(teachersNameAndId)

  useEffect(() => {
    async function loadPage() {
      if (!token) return;
      const { data: testsData } = await api.getTestsByTeacher(token);
      setTeachersDisciplines(testsData.tests);
      const { data: categoriesData } = await api.getCategories(token);
      setCategories(categoriesData.categories);
    }
    loadPage();
  }, [token]);

  
  async function searchTestByTeacherId(id: number){
    if (!token) return;
    const { data: testsData } = await api.getTestsByTeacherId(token, id);
    setTeachersDisciplines(testsData.tests);
    const { data: categoriesData } = await api.getCategories(token);
    setCategories(categoriesData.categories);
    setOpen(false)
  };

  useEffect(() => {
    async function searchTeachers(){
      if (!token) return;
      const { data } = await api.getAllTeachers(token);
      setTeachersNameAndId(data);
    };
    searchTeachers();
  }, [token]);  

  function renderRow(props: ListChildComponentProps) {
  const { index, style } = props;
    return (
      <ListItem style={style} key={index} component="div" disablePadding>
        <ListItemButton>
          <ListItemText primary={teachersNameAndId[index].name} onClick={() => searchTestByTeacherId(teachersNameAndId[index].id)}/>
        </ListItemButton>
      </ListItem>
    )
  };

  function showNames(){
    console.log(nameSearch);
  };

  return (
    <>
      {open && <CloseSearchBox onClick={() => setOpen(false)}></CloseSearchBox>}
      <TextField
        sx={{ marginX: "auto",
        marginBottom: "25px",
        width: "450px",
        position: 'relative',
        zIndex: '2' 
        }} 
        label="Pesquise por pessoa instrutora"
        onChange={(e) => setNameSearch(e.target.value)}
        value={nameSearch} 
        onFocus={() => {setOpen(true)}}
      />
      {open && nameSearch.length >=3 &&
        <Box
          sx={{
              height: "auto",
              width: '450px',
              bgcolor: '#ffffff',
              position:'absolute',
              top: '220px',
              left: '50%',
              transform: 'translate(-50%)',
              borderRadius: '5px', 
              zIndex: '9',

            }}>
          <FixedSizeList
            height={200}
            width={450}
            itemSize={46}
            itemCount={teachersNameAndId.length}
            overscanCount={5}>
            {renderRow}
          </FixedSizeList>
        </Box>
      }
      <Divider sx={{ marginBottom: "35px" }} />
      <Box
        sx={{
          marginX: "auto",
          width: "700px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/app/disciplinas")}
          >
            Disciplinas
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/app/pessoas-instrutoras")}
          >
            Pessoa Instrutora
          </Button>
          <Button variant="outlined" onClick={() => navigate("/app/adicionar")}>
            Adicionar
          </Button>
        </Box>
        <TeachersDisciplinesAccordions
          categories={categories}
          teachersDisciplines={teachersDisciplines}
        />
      </Box>
    </>
  );
}

interface TeachersDisciplinesAccordionsProps {
  teachersDisciplines: TestByTeacher[];
  categories: Category[];
}

function TeachersDisciplinesAccordions({
  categories,
  teachersDisciplines,
}: TeachersDisciplinesAccordionsProps) {
  const teachers = getUniqueTeachers(teachersDisciplines); 

  return (
    <Box sx={{ marginTop: "50px" }}>
      {teachers.map((teacher) => (
        <Accordion sx={{ backgroundColor: "#FFF" }} key={teacher}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">{teacher}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {categories
              .filter(doesCategoryHaveTests(teacher, teachersDisciplines))
              .map((category) => (
                <Categories
                  key={category.id}
                  category={category}
                  teacher={teacher}
                  teachersDisciplines={teachersDisciplines}
                />
              ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

function getUniqueTeachers(teachersDisciplines: TestByTeacher[]) {
  return [
    ...new Set(
      teachersDisciplines.map(
        (teacherDiscipline) => teacherDiscipline.teacher.name
      )
    ),
  ];
}

function doesCategoryHaveTests(
  teacher: string,
  teachersDisciplines: TeacherDisciplines[]
) {
  return (category: Category) =>
    teachersDisciplines.filter(
      (teacherDiscipline) =>
        teacherDiscipline.teacher.name === teacher &&
        testOfThisCategory(teacherDiscipline, category)
    ).length > 0;
}

function testOfThisCategory(
  teacherDiscipline: TeacherDisciplines,
  category: Category
) {
  return teacherDiscipline.tests.some(
    (test) => test.category.id === category.id
  );
}

interface CategoriesProps {
  teachersDisciplines: TeacherDisciplines[];
  category: Category;
  teacher: string;
}

function Categories({
  category,
  teachersDisciplines,
  teacher,
}: CategoriesProps) {
  return (
    <>
      <Box sx={{ marginBottom: "8px" }}>
        <Typography fontWeight="bold">{category.name}</Typography>
        {teachersDisciplines
          .filter(
            (teacherDiscipline) => teacherDiscipline.teacher.name === teacher
          )
          .map((teacherDiscipline) => (
            <Tests
              key={teacherDiscipline.id}
              tests={teacherDiscipline.tests.filter(
                (test) => test.category.id === category.id
              )}
              disciplineName={teacherDiscipline.discipline.name}
            />
          ))}
      </Box>
    </>
  );
}

interface TestsProps {
  disciplineName: string;
  tests: Test[];
}

function Tests({ tests, disciplineName }: TestsProps) {
  return (
    <>
      {tests.map((test) => (
        <Typography key={test.id} color="#878787">
          <Link
            href={test.pdfUrl}
            target="_blank"
            underline="none"
            color="inherit"
          >{`${test.name} (${disciplineName})`}</Link>
        </Typography>
      ))}
    </>
  );
}

const CloseSearchBox = styled.div`
  width: 100vw;
  position: fixed;
  background: rgba(0, 0, 0, 0);
  height: 100vw;
  z-index: 1;
`

export default Instructors;
